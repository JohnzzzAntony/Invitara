/* ==========================================================================
   Scene: confetti — paper squares tumbling and settling, for a birthday.

   Ported from the motion vocabulary of the old standalone invitation.html
   (a CDN-three.js particle field), rebuilt on this engine's scene contract
   and the self-hosted vendor/three.min.js.

   One InstancedMesh carries every piece, so the whole fall is one draw call.
   The trick that makes paper read as paper rather than as dots: each piece
   tumbles on two axes at once, at rates that are prime-ish relative to each
   other, so it flashes edge-on at irregular intervals the way real confetti
   does. A single rotation axis reads as a spinning coin — mechanical.
   ========================================================================== */
(function () {
  'use strict';

  window.INVITE_SCENES = window.INVITE_SCENES || {};

  window.INVITE_SCENES.confetti = function (THREE, renderer, ctx) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, ctx.width / ctx.height, 0.1, 300);
    camera.position.set(0, 0, 24);

    renderer.setClearColor(0x000000, 0);

    /* Area-proportional, like the petals scene: the same count that reads as
       a celebration on a desktop is a whiteout on a phone, and it is also a
       matrix composition per piece per frame on the weakest GPU of the three. */
    var area = ctx.width * ctx.height;
    var COUNT = Math.max(80, Math.min(220, Math.round(area / 7600)));

    var pal = ctx.palette;
    var TINTS = pal
      ? [pal.accent, pal.accent2, pal.gold, pal.soft, 0xffffff]
      : [0xe0567f, 0xf8dce6, 0xe0a63c, 0x8f7fb0, 0xffffff];

    var mesh = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.5, 0.72),
      new THREE.MeshStandardMaterial({
        roughness: 0.42,
        metalness: 0.12,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.96
      }),
      COUNT
    );
    scene.add(mesh);

    var state = [];
    var dummy = new THREE.Object3D();
    var colour = new THREE.Color();

    for (var i = 0; i < COUNT; i++) {
      state.push({
        x: (Math.random() - 0.5) * 48,
        y: Math.random() * 56 - 28,
        z: (Math.random() - 0.5) * 26 - 3,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        /* Two tumble rates per piece, deliberately unequal. */
        sx: 0.7 + Math.random() * 1.9,
        sy: 0.5 + Math.random() * 1.4,
        scale: 0.55 + Math.random() * 0.85,
        fall: 1.1 + Math.random() * 1.9,
        sway: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2
      });
      mesh.setColorAt(i, colour.setHex(TINTS[i % TINTS.length]));
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    /* Warm key light from the upper left, cool fill from the right, so a
       tumbling square changes colour as it turns rather than just dimming. */
    var key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(-6, 9, 8);
    scene.add(key);
    var fill = new THREE.DirectionalLight(pal ? pal.soft : 0xdfe8ee, 0.5);
    fill.position.set(7, -4, 5);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xffffff, 0.42));

    var last = 0;

    function frame(t, mouse) {
      /* Delta-time, not absolute-time, so a tab that was throttled resumes
         where it was instead of teleporting every piece down the screen. */
      var dt = last ? Math.min(0.05, t - last) : 0.016;
      last = t;

      for (var i = 0; i < COUNT; i++) {
        var p = state[i];

        p.y -= p.fall * dt * 3.4;
        p.rx += p.sx * dt;
        p.ry += p.sy * dt;

        /* Recycle above the frame once a piece leaves the bottom. */
        if (p.y < -30) {
          p.y = 30 + Math.random() * 6;
          p.x = (Math.random() - 0.5) * 48;
        }

        var drift = Math.sin(t * 0.7 + p.phase) * p.sway;
        var mx = (mouse ? mouse.x : 0) * 1.4;

        dummy.position.set(p.x + drift + mx, p.y, p.z);
        dummy.rotation.set(p.rx, p.ry, p.rz + drift * 0.12);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;

      camera.position.x = (mouse ? mouse.x : 0) * 1.1;
      camera.position.y = (mouse ? -mouse.y : 0) * 0.7;
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
