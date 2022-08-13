import { GUI } from "dat.gui";
import { Renderer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export interface BasicSceneOptions {
  addGridHelper: boolean;
}

export interface BasicSceneProps {
  renderer: Renderer;
  loader: GLTFLoader;
  options: BasicSceneOptions;
  debugHelper?: GUI;
}
