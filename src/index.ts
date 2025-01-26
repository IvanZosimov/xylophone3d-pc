import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Timer } from 'three/examples/jsm/misc/Timer.js';
import { scene } from './components/scene';
import { addLights } from './components/lights';
import { addAxesHelper } from './helpers/axesHelper/axesHelper';
import { setupGui } from './helpers/gui/guiSettings';

const canvas: HTMLElement | undefined =
  (document.querySelector('canvas.webgl') as HTMLElement) ?? undefined;

const axesHelper = addAxesHelper();
setupGui(axesHelper);
addLights();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 5, 5);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas,
});

renderer.setSize(sizes.width, sizes.height);

const timer = new Timer();

const tick = () => {
  timer.update();

  controls.update();

  //   const elapsedTime = timer.getElapsed();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
