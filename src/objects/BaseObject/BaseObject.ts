import { GUI } from "dat.gui";
import { Object3D } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export abstract class BaseObject extends Object3D {
  modelName: string | null = null;
  model: GLTF;
  debugHelper?: GUI;
  name: string;

  constructor(name: string, model: string | null, debugHelper?: GUI) {
    super();
    this.modelName = model;
    this.name = name;

    if (!debugHelper) {
      return;
    }
    this.debugHelper = debugHelper;

    if (!this.debugHelper.__folders[this.name]) {
      debugHelper.addFolder(this.name);
    }

    this.debugHelper.__folders[this.name].open();
  }

  initModel(loader: GLTFLoader): Promise<GLTF | void> {
    if (!this.modelName) {
      throw Error(
        "A 3D Object class must be provided with a path to the model."
      );
    }

    return new Promise((resolve, reject) => {
      loader.load(
        this.modelName,
        (gltf) => {
          this.add(gltf.scene);
          this.model = gltf;
          resolve(gltf);
        },
        undefined,
        (event: ErrorEvent) => {
          reject(event);
        }
      );
    });
  }

  setInitialDebugPosition(vector: THREE.Vector3): void {
    this.debugHelper.__folders[this.name].add(this.position, "x", vector.x);
    this.debugHelper.__folders[this.name].add(this.position, "y", vector.y);
    this.debugHelper.__folders[this.name].add(this.position, "z", vector.z);
  }
}
