import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let renderer, scene, camera, controls;

let particles = null;
let geometry = null;
let material = null;

const pointer = new THREE.Vector2();

let raycaster, intersects;

const threshold = 0.02;

const parameters = {
  count: 1000,
  size: 0.05,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984'
}

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

init();

function init() {
  const canvas = document.querySelector('canvas.webgl');

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
  camera.position.x = 3
  camera.position.y = 3
  camera.position.z = 6
  scene.add(camera)

  // Controls
  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true

  generateGalaxy();

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setAnimationLoop( animate );

  //

  raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = threshold;

  //

  window.addEventListener( 'resize', onWindowResize );
  window.addEventListener( 'click', (event) => onParticleClick(event));
}

function animate() {

  renderer.render(scene, camera);

  // Update controls
  controls.update()
}

function onParticleClick(event) {
  onPointerMove(event);

  raycaster.setFromCamera(pointer, camera);
  intersects = raycaster.intersectObject(particles);

  const particlesPositionArray = particles.geometry.attributes.position.array;

  const r = Math.random();
  const g = Math.random();
  const b = Math.random();

  if (intersects.length > 0) {
    let closestIntersect = null;

    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].distanceToRay <= parameters.size) {
        closestIntersect = intersects[i];
        break;
      }
    }

    if (closestIntersect) {
      const closestPoint = closestIntersect.point;

      for (let i = 0; i < particlesPositionArray.length; i += 3) {
        const x = particlesPositionArray[i    ];
        const y = particlesPositionArray[i + 1];
        const z = particlesPositionArray[i + 2];
        const neighbParticle = new THREE.Vector3(x, y, z);

        if (neighbParticle.distanceTo(closestPoint) < 1.0) {
          particles.geometry.attributes.color.setXYZ(i / 3, r, g, b);
        }
      }

      const colors = particles.geometry.attributes.color;

      colors.needsUpdate = true;
    }
  }
}


function generateGalaxy() {
  if (particles !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(particles);
  }

  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor)
  const colorOutside = new THREE.Color(parameters.outsideColor)

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin
    const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius;
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius;
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius;


    positions[i3    ] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3    ] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
  }); 

  //Galaxy
  particles = new THREE.Points(geometry, material);

  scene.add(particles);

  // Debug
  const gui = new GUI()
  gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
  gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
  gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
  gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
  gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);

}

function onPointerMove( event ) {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onWindowResize() {
   // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

   // Update camera
   camera.aspect = sizes.width / sizes.height;
   camera.updateProjectionMatrix();

   // Update renderer
   renderer.setSize(sizes.width, sizes.height)
}
