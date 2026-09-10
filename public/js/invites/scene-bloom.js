/* ==========================================================================
   Scene: bloom — soft spheres rising and swelling, for a baby shower.

   The gentlest of the scenes on purpose: a shower invitation should feel
   like light through a window, not weather. Everything drifts upward, and
   nothing crosses the frame quickly enough to pull the eye off the names.

   Two details do the work. Spheres are given a low-poly budget (10x10) and
   a high roughness, which reads as soft paper rather than glass — a smooth
   shiny sphere over a photograph looks like a rendering error. And each
   sphere's scale breathes on its own phase, so the field never pulses in
   unison, which is what makes a particle system look like a screensaver.
   ========================================================================== */
(function () {
  'use strict';

  window.INVITE_SCENES = window.INVITE_SCENES || {};

  window.INVITE_SCENES.bloom = function (THREE, renderer, ctx) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(56, ctx.width / ctx.height, 0.1, 300);
    camera.position.set(0, 0, 22);

    renderer.setClearColor(0x000000, 0);

    var area = ctx.width * ctx.height;
    var COUNT = Math.max(46, Math.min(120, Math.round(area / 13000)));

    var pal = ctx.palette;
    var TINTS = pal
      ? [pal.soft, pal.accent2, pal.gold, 0xffffff]
      : [0xf8ebcd, 0xfdf8ea, 0xe0a63c, 0xffffff];

    var mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.5, 10, 10),
      new THREE.MeshStandardMaterial({
        roughness: 0.86,
        metalness: 0.0,
        transparent: true,
        opacity: 0.72
      }),
      COUNT
    );
    scene.add(mesh);

    var state = [];
    var dummy = new THREE.Object3D();
    var colour = new THREE.Color();

    for (var i = 0; i < COUNT; i++) {
      state.push({
        x: (Math.random() - 0.5) * 44,
        y: Math.random() * 52 - 26,
        z: (Math.random() - 0.5) * 22 - 2,
        base: 0.35 + Math.random() * 1.15,
        rise: 0.35 + Math.random() * 0.85,
        sway: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        breath: 0.5 + Math.random() * 1.1
      });
      mesh.setColorAt(i, colour.setHex(TINTS[i % TINTS.length]));
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    var key = new THREE.DirectionalLight(0xffffff, 0.95);
    key.position.set(-4, 8, 9);
    scene.add(key);
    scene.add(new THREE.AmbientLight(pal ? pal.soft : 0xfff4dd, 0.72));

    var last = 0;

    function frame(t, mouse) {
      var dt = last ? Math.min(0.05, t - last) : 0.016;
      last = t;

      for (var i = 0; i < COUNT; i++) {
        var p = state[i];

        p.y += p.rise * dt * 2.1;
        if (p.y > 28) {
          p.y = -28 - Math.random() * 5;
          p.x = (Math.random() - 0.5) * 44;
        }

        var drift = Math.sin(t * 0.45 + p.phase) * p.sway;
        var swell = p.base * (1 + Math.sin(t * p.breath + p.phase) * 0.16);
        var mx = (mouse ? mouse.x : 0) * 1.0;

        dummy.position.set(p.x + drift + mx, p.y, p.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(swell);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;

      camera.position.x = (mouse ? mouse.x : 0) * 0.8;
      camera.position.y = (mouse ? -mouse.y : 0) * 0.5;
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
