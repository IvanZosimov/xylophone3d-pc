import * as THREE from 'three';
import { scene } from './scene';
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.position.set(8, 8, 8);

export function addLights() {
  scene.add(ambientLight);
  scene.add(directionalLight);
}
