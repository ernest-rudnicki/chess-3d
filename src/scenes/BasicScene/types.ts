import { GUI } from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export interface BasicSceneOptions {
  addGridHelper: boolean;
}

export interface BasicSceneProps {
  renderer: THREE.Renderer;
  loader: GLTFLoader;
  options: BasicSceneOptions;
  debugHelper?: GUI;
}
