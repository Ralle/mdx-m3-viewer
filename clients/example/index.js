// How webpack exports to the web.
const handlers = ModelViewer.default.viewer.handlers;
const common = ModelViewer.default.common;
const glMatrix = common.glMatrix;
const vec3 = glMatrix.vec3;
const quat = glMatrix.quat;

let canvas = document.getElementById('canvas');

canvas.width = 800;
canvas.height = 600;

// Create the viewer!
let viewer = new ModelViewer.default.viewer.ModelViewer(canvas);

// Create a new scene. Each scene has its own camera, and a list of things to render.
let scene = viewer.addScene();

// Check camera.js!
setupCamera(scene);

// Events.
viewer.on('loadstart', (viewer, path) => console.log('loadstart', path));
viewer.on('load', (viewer, path) => console.log('load', path));
viewer.on('loadend', (viewer, path) => console.log('loadend path', path));
viewer.on('error', (viewer, error, reason) => console.log(viewer, error, reason));

// Add the needed handlers.
viewer.addHandler(handlers.mdx);
viewer.addHandler(handlers.blp);

// A path solver is used for every load call.
// Given a possibly relative source, it should return the actual source to load from.
// This can be in the form of an URL string, or direct sources from memory (e.g. a previously loaded ArrayBuffer).
function pathSolver(src) {
  return 'resources/' + src;
}

// Load our MDX model!
let modelPromise = viewer.load('SmileyGW_004.mdx', pathSolver);

modelPromise.then((model) => {
  // The promise can return undefined if something went wrong!
  if (model) {
    // Create an instance of this model.
    let instance = model.addInstance();

    // Set the instance's scene.
    // Equivalent to scene.addInstance(instance)
    instance.setScene(scene);

    // Want to run the second animation.
    // 0 is the first animation, and -1 is no animation.
    instance.setSequence(1);

    // Tell the instance to loop animations forever.
    // This overrides the setting in the model itself.
    instance.setSequenceLoopMode(2);

    // Let's create another instance and do other stuff with it.
    let instance2 = model.addInstance();
    instance2.setScene(scene);
    instance2.setSequence(0);
    instance2.setSequenceLoopMode(2);
    instance2.move([100, 100, 0]);
    instance2.uniformScale(0.5);

    // And a third one.
    let instance3 = model.addInstance();
    instance3.setScene(scene);
    instance3.setSequence(2);
    instance3.setSequenceLoopMode(2);
    instance3.move([-100, -100, 0]);
  }
});

// The viewer has the update(), startFrame(), render(), and updateAndRender() functions.
// Generally speaking, you will want a simple never ending loop like the one that follows, but who knows. The control is in your hands.
(function step() {
  requestAnimationFrame(step);

  viewer.updateAndRender();
})();
