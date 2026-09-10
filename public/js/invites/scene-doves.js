/* ==========================================================================
   Scene: doves — slow feathers turning through soft light, for a christening.

   No birds. A recognisable dove modelled in code reads as clip art at any
   size, and a christening page cannot carry clip art. What it renders is
   feathers: a tapered bezier shape, cupped along its length, drifting down
   and rotating far more slowly than the petals scene.

   The one thing that distinguishes a feather from a petal here is asymmetry.
   The shape's two bezier sides use different control points, so the silhouette
   never resolves into a leaf, and the vertex push along z is stronger at the
   tip than the base — which is what makes it catch the key light on a curve
   as it turns rather than flashing flat.
   ========================================================================== */
(function () {
  'use strict';

  window.INVITE_SCENES = window.INVITE_SCENES || {};

  function featherGeometry(THREE) {
    var s = new THREE.Shape();
    s.moveTo(0, -0.62);
    /* Wider, rounder side. */
    s.bezierCurveTo(0.30, -0.30, 0.26, 0.34, 0, 0.66);
    /* Narrower side, pulled in — the asymmetry is the point. */
    s.bezierCurveTo(-0.17, 0.30, -0.21, -0.30, 0, -0.62);

    var g = new THREE.ShapeGeometry(s, 16);
    var p = g.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i);
      var y = p.getY(i);
      /* Curl grows toward the tip (positive y), so the quill end stays flat. */
      var tip = Math.max(0, y + 0.62) / 1.28;
      p.setZ(i, (x * x) * 0.7 + tip * tip * 0.34);
    }
    g.computeVertexNormals();
    return g;
  }

  window.INVITE_SCENES.doves = function (THREE, renderer, ctx) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(54, ctx.width / ctx.height, 0.1, 300);
    camera.position.set(0, 0, 23);

    renderer.setClearColor(0x000000, 0);

    var area = ctx.width * ctx.height;
    var COUNT = Math.max(40, Math.min(110, Math.round(area / 14000)));

    var pal = ctx.palette;
    var TINTS = pal
      ? [0xffffff, pal.soft, pal.accent2, pal.gold]
      : [0xffffff, 0xe5edf3, 0xf7f9fb, 0x9fb4c7];

    var mesh = new THREE.InstancedMesh(
      featherGeometry(THREE),
      new THREE.MeshStandardMaterial({
        roughness: 0.74,
        metalness: 0.04,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.82
      }),
      COUNT
    );
    scene.add(mesh);

    var state = [];
    var dummy = new THREE.Object3D();
    var colour = new THREE.Color();

    for (var i = 0; i < COUNT; i++) {
      state.push({
        x: (Math.random() - 0.5) * 46,
        y: Math.random() * 54 - 27,
        z: (Math.random() - 0.5) * 24 - 3,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        /* Deliberately slower than petals — this should feel weightless. */
        sx: 0.16 + Math.random() * 0.42,
        sz: 0.10 + Math.random() * 0.30,
        scale: 0.5 + Math.random() * 0.95,
        fall: 0.42 + Math.random() * 0.78,
        sway: 0.8 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2
      });
      mesh.setColorAt(i, colour.setHex(TINTS[i % TINTS.length]));
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    var key = new THREE.DirectionalLight(0xffffff, 1.05);
    key.position.set(-5, 9, 7);
    scene.add(key);
    var rim = new THREE.DirectionalLight(pal ? pal.gold : 0x9fb4c7, 0.42);
    rim.position.set(6, -5, 4);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.52));

    var last = 0;

    function frame(t, mouse) {
      var dt = last ? Math.min(0.05, t - last) : 0.016;
      last = t;

      for (var i = 0; i < COUNT; i++) {
        var p = state[i];

        p.y -= p.fall * dt * 2.2;
        p.rx += p.sx * dt;
        p.rz += p.sz * dt;

        if (p.y < -29) {
          p.y = 29 + Math.random() * 6;
          p.x = (Math.random() - 0.5) * 46;
        }

        /* A feather does not fall straight: two sine terms at different
           rates give it the side-to-side settle instead of a pendulum. */
        var drift = Math.sin(t * 0.34 + p.phase) * p.sway +
                    Math.sin(t * 0.81 + p.phase * 1.7) * p.sway * 0.34;
        var mx = (mouse ? mouse.x : 0) * 1.2;

        dummy.position.set(p.x + drift + mx, p.y, p.z);
        dummy.rotation.set(p.rx, p.ry, p.rz + drift * 0.08);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;

      camera.position.x = (mouse ? mouse.x : 0) * 0.9;
      camera.position.y = (mouse ? -mouse.y : 0) * 0.6;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    function resize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function dispose() {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }

    return { frame: frame, resize: resize, dispose: dispose };
  };
})();
