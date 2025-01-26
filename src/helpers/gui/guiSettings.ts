import * as THREE from 'three';
import { gui } from './gui';
import { scene } from '../../components/scene';

export const debugObject = {
  axesHelper: {
    visible: true,
    length: 3,
  },
};

export function setupGui(axesHelper: THREE.AxesHelper) {
  const axesHelperFolder = gui.addFolder('Axes helper');
  const axesVisibilityController = axesHelperFolder.add(
    debugObject.axesHelper,
    'visible'
  );
  const axesLengthController = axesHelperFolder.add(
    debugObject.axesHelper,
    'length',
    0,
    100,
    0.5
  );

  axesVisibilityController.onChange((value) => {
    axesHelper.visible = value;
  });

  axesLengthController.onFinishChange((value) => {
    scene.remove(axesHelper);
    axesHelper.dispose();
    axesHelper = new THREE.AxesHelper(value);
    axesHelper.visible = debugObject.axesHelper.visible;
    axesHelper.setColors('red', 'green', 'blue');
    scene.add(axesHelper);
  });
}
