function ModelViewer(canvas) {
    EventDispatcher.call(this);

    this.resources = {
        models: {
            array: [],
            map: new Map()
        },

        textures: {
            array: [],
            map: new Map()
        },

        files: {
            array: [],
            map: new Map()
        }
    };

    this.frameTimeMS = 1000 / 60;
    this.frameTimeS = 1 / 60;

    this.handlers = new Map(); // Map from a file extension to an handler

    this.camera = new Camera(Math.PI / 4, 1, 10, 100000);

    this.canvas = canvas;
    this.webgl = new WebGL(canvas);
    this.gl = this.webgl.gl;

    this.sharedShaders = {
        // Shared shader code to mimic gl_InstanceID
        "instanceId": `
            attribute float a_InstanceID;
        `,
        // Shared shader code to handle bone textures
        "boneTexture": `
            uniform sampler2D u_boneMap;
            uniform float u_vector_size;
            uniform float u_matrix_size;
            uniform float u_row_size;

            mat4 boneAtIndex(float column, float row) {
                float offset = column * u_matrix_size,
                rowOffset = row * u_row_size;

                return mat4(texture2D(u_boneMap, vec2(offset, rowOffset)), texture2D(u_boneMap, vec2(offset + u_vector_size, rowOffset)), texture2D(u_boneMap, vec2(offset + u_vector_size * 2.0, rowOffset)), texture2D(u_boneMap, vec2(offset + u_vector_size * 3.0, rowOffset)));
            }

            `,
        // Shared shader code to handle decoding multiple bytes stored in floats
        "decodeFloat": `
            vec2 decodeFloat2(float f) {
                vec2 v;

                v[1] = floor(f / 256.0);
                v[0] = floor(f - v[1] * 256.0);

                return v;
            }

            vec3 decodeFloat3(float f) {
                vec3 v;

                v[2] = floor(f / 65536.0);
                v[1] = floor((f - v[2] * 65536.0) / 256.0);
                v[0] = floor(f - v[2] * 65536.0 - v[1] * 256.0);

                return v;
            }
        `
    };

    // Add support for native textures
    this.addHandler(NativeTexture);

    // Initialize the viewport
    this.resetViewport();

    // Update the viewport when the window is resized
    window.addEventListener("resize", () => this.resetViewport());

    // Main loop
    const step = () => { requestAnimationFrame(step); this.update(); this.render(); };
    step();
}

ModelViewer.prototype = {
    addHandler(handler) {
        const handlers = this.handlers;

        // Run the global initialization function of the handler
        handler.initialize(this);

        // Register the handler for each of its file types
        for (let extension of handler.extension.split("|")) {
            if (!handlers.has(extension)) {
                handlers.set(extension, handler);

                //console.debug("Registered handler:", extension);
            }
        }
    },

    // src can either be a single object, or an array
    // if it's an array, an array will be returned, otherwise a single object will be returned
    //
    // options:
    //      1) src is a model or an instance => create a new instance
    //      2) src is an url or some kind of buffer => normal load
    //      3) src is a built-in JS image source (HTMLImageElement, HTMLVideoElement, HTMLCanvasElement, ImageData) => pathSolver isn't used
    //
    // pathSolver is a function with the following signature: function (source) => [source, fileType, isUrl]
    // if isUrl is true-like, the source is considered to be an url, and a server fetch will be done
    // if isUrl is false-like, the source is considered to be a buffer that the handler can parse, with no server fetches
    // note that pathSolver will be used by the loaded resource to solve the paths of all internal resources (e.g. a model will use it to figure where its textures are located!)
    load(src, pathSolver) {
        if (Array.isArray(src)) {
            return src.map((single) => this.loadSingle(single, pathSolver));
        }

        return this.loadSingle(src, pathSolver);
    },

    // Call callback when all of the given resources have finished loading
    // If all of the given resources already loaded, it will be called immediately
    whenAllLoaded(resources, callback) {
        let loaded = 0,
            wantLoaded = resources.length;

        function gotLoaded() {
            loaded += 1;

            if (loaded === wantLoaded) {
                callback(resources);
            }
        }

        for (let i = 0; i < wantLoaded; i++) {
            resources[i].whenLoaded(gotLoaded);
        }
    },

    loadSingle(src, pathSolver) {
        if (src) {
            let extension, serverFetch;

            // Built-in texture source
            if (src instanceof HTMLImageElement || src instanceof HTMLVideoElement || src instanceof HTMLCanvasElement || src instanceof ImageData) {
                extension = ".png";
                serverFetch = false;
            } else {
                [src, extension, serverFetch] = pathSolver(src);
            }

            const handler = this.handlers.get(extension);

            // Is there an handler for this file type?
            if (handler) {
                return this.loadResource(src, extension, serverFetch, pathSolver, handler);
            } else {
                this.dispatchEvent({ type: "error", error: "Unsupported file extension: " + extension + " (" + src + ")" })
            }
        }
    },

    registerEvents(resource) {
        const listener = e => this.dispatchEvent(e);

        ["loadstart", "load", "loadend", "error", "progress", "delete"].map(e => resource.addEventListener(e, listener));
    },

    loadResource(src, extension, serverFetch, pathSolver, handler) {
        let allResources = this.resources,
            resources,
            constructor;

        // Model
        if (handler.objectType === "modelhandler") {
            resources = allResources.models;
            constructor = handler.Model;
        // Texture
        } else if (handler.objectType === "texturehandler") {
            resources = allResources.textures;
            constructor = handler.Texture;
        // File
        } else if (handler.objectType === "filehandler") {
            resources = allResources.files;
            constructor = handler.File;
        } else {
            console.log(handler);
            throw "Trying to load a resource using an unknown handler for file extension " + extension + " (mix ModelHandler|TextureHandler|FileHandler with your handler!)";
        }

        const map = resources.map;

        if (!map.has(src)) {
            const resource = new constructor(this, pathSolver);

            map.set(src, resource);
            resources.array.push(resource);

            this.registerEvents(resource);

            resource.loadstart();
            resource.load(src, handler.binaryFormat, serverFetch);
        }

        return map.get(src);
    },

    clear() {
        const resources = this.resources;

        for (let objects of [resources.models, resources.textures, resources.files]) {
            objects.array.length = 0;
            objects.map.clear();
        }
    },

    update() {
        const models = this.resources.models.array;

        for (let i = 0, l = models.length; i < l; i++) {
            models[i].update();
        }
    },

    render() {
        let gl = this.gl,
            models = this.resources.models.array,
            l = models.length;

        // See https://www.opengl.org/wiki/FAQ#Masking
        gl.depthMask(1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (let i = 0; i < l; i++) {
            models[i].renderViewsOpaque();
        }

        for (let i = 0; i < l; i++) {
            models[i].renderViewsTranslucent();
        }

        for (let i = 0; i < l; i++) {
            models[i].renderViewsEmitters();
        }

        this.dispatchEvent({ type: "render" })
    },

    resetViewport() {
        const width = canvas.clientWidth,
            height = canvas.clientHeight;

        canvas.width = width;
        canvas.height = height;

        this.gl.viewport(0, 0, width, height);

        this.camera.setViewport([0, 0, width, height]);
    }
};

mix(ModelViewer.prototype, EventDispatcher.prototype);
