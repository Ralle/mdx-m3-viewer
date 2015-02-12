var defaultTransformations = {
    translation: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    scaling: [1, 1, 1]
};

function Skeleton(model, ctx) {
    var i, l;
    var pivots = model.pivots;
    var nodes = model.nodes;
    var bones = model.bones;
    var hierarchy = model.hierarchy;

    this.hierarchy = hierarchy;

    // If there are no original bones, reference the root node injected by the parser, since the shader requires at least one bone
    this.bones = bones || [{node: 0}];

    BaseSkeleton.call(this, this.bones.length + 1, ctx);

    for (i = 0, l = nodes.length; i < l; i++) {
        this.nodes[i] = new ShallowNode(nodes[i]);
    }

    // To avoid heap allocations
    this.localMatrix = mat4.create();
    this.locationVec = vec3.create();
    this.scaleVec = vec3.create();
    this.rotationQuat = quat.create();
}

Skeleton.prototype = extend(BaseSkeleton.prototype, {
    update: function (sequence, frame, counter, worldMatrix, context) {
        var nodes = this.nodes;
        var hierarchy = this.hierarchy;
        var root = this.rootNode;

        root.update(worldMatrix);

        for (var i = 0, l = hierarchy.length; i < l; i++) {
            this.updateNode(nodes[hierarchy[i]], sequence, frame, counter, context);
        }

        this.updateHW(context.gl.ctx);
    },

    updateNode: function (node, sequence, frame, counter, context) {
        var parent = this.getNode(node.parentId);
        var nodeImpl = node.nodeImpl;
        var pivot = node.pivot;
        var negativePivot = node.negativePivot;
        var localMatrix = this.localMatrix;
        var translation = getSDValue(sequence, frame, counter, nodeImpl.sd.translation, defaultTransformations.translation, this.locationVec);
        var rotation = getSDValue(sequence, frame, counter, nodeImpl.sd.rotation, defaultTransformations.rotation, this.rotationQuat);
        var scale = getSDValue(sequence, frame, counter, nodeImpl.sd.scaling, defaultTransformations.scaling, this.scaleVec);
        // NOTE: This should not be needed, check how getSDValue works......
        var finalRotation = [];
        
        quat.multiply(node.worldRotation, parent.worldRotation, rotation);
        
        if (nodeImpl.billboarded) {
            quat.mul(finalRotation, rotation, quat.conjugate([], node.worldRotation));
            quat.rotateZ(finalRotation, finalRotation, -context.camera.phi - Math.PI / 2);
            quat.rotateY(finalRotation, finalRotation, -context.camera.theta - Math.PI / 2);
        } else {
            quat.copy(finalRotation, rotation);
        }
        
        mat4.fromRotationTranslationScaleOrigin(localMatrix, finalRotation, translation, scale, pivot);
        mat4.multiply(node.worldMatrix, parent.worldMatrix, localMatrix);

        node.updateScale();
    },

    updateHW: function (ctx) {
        var bones = this.bones,
            hwbones = this.hwbones,
            nodes = this.nodes;

        for (var i = 0, l = bones.length; i < l; i++) {
            hwbones.set(nodes[bones[i].node].worldMatrix, i * 16 + 16);
        }

        this.updateBoneTexture(ctx);
    }
});