import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

export function mountScene(root){
 const host=root.querySelector('[data-scene-host]');if(!host)return()=>{};
 let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return()=>{};}
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100),group=new THREE.Group(),geometries=[],materials=[],kind=root.dataset.scene;
 camera.position.z=7;scene.add(group);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 const pmrem=new THREE.PMREMGenerator(renderer),environment=new RoomEnvironment(),env=pmrem.fromScene(environment,.04);scene.environment=env.texture;environment.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xfff3dc,0x253957,2));const key=new THREE.DirectionalLight(0xffedcf,4);key.position.set(-3,4,5);scene.add(key);const rim=new THREE.DirectionalLight(0xb8d9ff,3);rim.position.set(4,-1,2);scene.add(rim);
 function geo(g){geometries.push(g);return g;}function mat(p){const m=new THREE.MeshStandardMaterial(p);materials.push(m);return m;}function mesh(g,m,parent=group){const o=new THREE.Mesh(g,m);parent.add(o);return o;}
 const gold=mat({color:0xc9ae77,metalness:1,roughness:.21}),silver=mat({color:0xe0e3e0,metalness:1,roughness:.16}),cream=mat({color:0xe2d8c9,metalness:.15,roughness:.6});
 function crescentShape(radius,inner,offset){const x=(radius*radius-inner*inner+offset*offset)/(2*offset),y=Math.sqrt(radius*radius-x*x),outerAngle=Math.atan2(y,x),innerAngle=Math.atan2(y,x-offset),shape=new THREE.Shape();shape.moveTo(x,y);shape.absarc(0,0,radius,outerAngle,Math.PI*2-outerAngle,false);shape.absarc(offset,0,inner,-innerAngle,innerAngle,true);shape.closePath();return shape;}
 const animated=[];
 if(kind==='rings'){
  const ring=geo(new THREE.TorusGeometry(1,.115,20,100));const a=mesh(ring,gold),b=mesh(ring,silver);a.position.set(-.52,.08,0);a.rotation.set(.75,.5,-.35);b.position.set(.55,-.22,.18);b.rotation.set(-.55,.2,.45);animated.push(a,b);group.rotation.z=-.2;
 }
 if(kind==='mobile'){
  const moon=crescentShape(.87,.76,.32);const crescent=mesh(geo(new THREE.ExtrudeGeometry(moon,{depth:.15,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.07,bevelThickness:.07,curveSegments:40})),cream);crescent.rotation.z=-.35;crescent.position.y=.1;
  const colors=[0xc85a32,0x1b2a49,0xcab88c,0xe2d8c9];const positions=[[-1.4,.5,-.2],[1.35,.65,0],[-.85,-1.1,.2],[1.1,-.95,-.3]];positions.forEach((p,i)=>{const ball=mesh(geo(new THREE.SphereGeometry(i===0?.21:.16,24,16)),mat({color:colors[i],roughness:.55}));ball.position.set(...p);animated.push(ball);const wire=mesh(geo(new THREE.CylinderGeometry(.006,.006,1.2,6)),mat({color:0x9c947e,metalness:.5,roughness:.5}));wire.position.set(p[0],p[1]+.6,p[2]);});
 }
 if(kind==='disco'){
  mesh(geo(new THREE.SphereGeometry(1.18,36,24)),mat({color:0x555652,metalness:1,roughness:.2}));const tileGeometry=geo(new THREE.BoxGeometry(.1,.1,.025)),count=24*38,tiles=new THREE.InstancedMesh(tileGeometry,silver,count),dummy=new THREE.Object3D();group.add(tiles);let index=0;
  for(let row=0;row<24;row++){const theta=(row+.5)/24*Math.PI;for(let col=0;col<38;col++){const phi=col/38*Math.PI*2;dummy.position.set(1.195*Math.sin(theta)*Math.cos(phi),1.195*Math.cos(theta),1.195*Math.sin(theta)*Math.sin(phi));dummy.lookAt(dummy.position.clone().multiplyScalar(2));dummy.scale.set(Math.max(.25,Math.sin(theta)),1,1);dummy.updateMatrix();tiles.setMatrixAt(index++,dummy.matrix);}}tiles.instanceMatrix.needsUpdate=true;
  const wire=mesh(geo(new THREE.CylinderGeometry(.006,.006,3,6)),silver);wire.position.y=2.65;group.rotation.z=.08;
 }
 if(kind==='sculpture'){
  const knot=geo(new THREE.TorusKnotGeometry(.98,.31,140,16,2,3));const skin=mat({color:0xc28f79,metalness:.85,roughness:.32,wireframe:true});mesh(knot,skin);const core=mesh(geo(new THREE.TorusKnotGeometry(.96,.25,100,12,2,3)),mat({color:0x1c252e,metalness:.7,roughness:.45}));core.scale.setScalar(.96);group.rotation.set(.5,.3,.15);group.scale.setScalar(1.15);
 }
 if(kind==='crescent'){
  const shape=crescentShape(1.05,.95,.4);const crescent=mesh(geo(new THREE.ExtrudeGeometry(shape,{depth:.14,steps:1,bevelEnabled:true,bevelSegments:4,bevelSize:.045,bevelThickness:.05,curveSegments:60})),gold);crescent.rotation.set(.05,-.3,-.35);group.position.y=.3;
  for(let i=0;i<9;i++){const star=mesh(geo(new THREE.OctahedronGeometry(.025+(i%3)*.015)),gold);star.position.set(Math.sin(i*2.4)*1.7,Math.cos(i*2.4)*1.5,-.3);animated.push(star);}
 }
 if(kind==='snow'){
  const points=geo(new THREE.BufferGeometry()),positions=new Float32Array(190*3);for(let i=0;i<190;i++){positions[i*3]=Math.sin(i*73.7)*5;positions[i*3+1]=Math.cos(i*12.31)*5;positions[i*3+2]=Math.sin(i*31.17)*2;}points.setAttribute('position',new THREE.BufferAttribute(positions,3));const snowMaterial=new THREE.PointsMaterial({color:0xe2d8c9,size:.025,transparent:true,opacity:.7,sizeAttenuation:true});materials.push(snowMaterial);group.add(new THREE.Points(points,snowMaterial));
 }
 let disposed=false,visible=false,last=0,elapsed=0,pointer={x:0,y:0};const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function resize(){const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=width<420?8:7;camera.updateProjectionMatrix();renderer.render(scene,camera);}const ro=new ResizeObserver(resize);ro.observe(host);resize();host.classList.add('has-webgl');
 function frame(time){if(time-last<32)return;const dt=Math.min((time-last)/1000,.05);last=time;elapsed+=dt;if(kind==='disco')group.rotation.y=elapsed*.14+pointer.x*.13;else if(kind==='snow'){group.rotation.z=Math.sin(elapsed*.035)*.2;group.position.y=-Math.sin(elapsed*.09)*.65;}else{group.rotation.y=Math.sin(elapsed*.22)*.22+pointer.x*.15;group.rotation.x=Math.sin(elapsed*.17)*.08+pointer.y*.06;}animated.forEach((object,i)=>{object.rotation.z+=dt*.05*(i%2?1:-1);});renderer.render(scene,camera);}
 function sync(){const run=!disposed&&visible&&!document.hidden&&!reduced.matches&&root.dataset.paused!=='true'&&root.dataset.motion!=='none';last=performance.now();renderer.setAnimationLoop(run?frame:null);root.dataset.sceneRunning=String(run);if(!run&&!disposed)renderer.render(scene,camera);}
 const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.01});io.observe(host);
 function move(event){if(event.pointerType==='touch')return;pointer.x=event.clientX/innerWidth*2-1;pointer.y=event.clientY/innerHeight*2-1;}function lost(event){event.preventDefault();dispose();}
 root.addEventListener('pointermove',move,{passive:true});root.addEventListener('edition-motion',sync);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);renderer.domElement.addEventListener('webglcontextlost',lost);
 function dispose(){if(disposed)return;disposed=true;renderer.setAnimationLoop(null);io.disconnect();ro.disconnect();root.removeEventListener('pointermove',move);root.removeEventListener('edition-motion',sync);document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);renderer.domElement.removeEventListener('webglcontextlost',lost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());env.dispose();renderer.dispose();renderer.domElement.remove();host.classList.remove('has-webgl');root.dataset.sceneRunning='false';}
 return dispose;
}
