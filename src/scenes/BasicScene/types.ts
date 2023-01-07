import { ColorRepresentation, Renderer, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export interface BasicSceneOptions {
  addGridHelper: boolean;
  lightHelpers?: boolean;
  cannonDebugger?: boolean;
}

export interface BasicSceneProps {
  renderer: Renderer;
  loader: GLTFLoader;
  options: BasicSceneOptions;
}

export interface LightOptions {
  color: ColorRepresentation;
  position: Vector3;
  intensity: number;
  lookAt?: Vector3;
  castShadow?: boolean;
}
