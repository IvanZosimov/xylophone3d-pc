import * as THREE from 'three';
import { debugObject } from '../gui/guiSettings';
import { scene } from '../../components/scene';

export const axesHelper = new THREE.AxesHelper(debugObject.axesHelper.length);
axesHelper.visible = debugObject.axesHelper.visible;
axesHelper.setColors('red', 'green', 'blue');

export function addAxesHelper() {
  scene.add(axesHelper);
  return axesHelper;
}
