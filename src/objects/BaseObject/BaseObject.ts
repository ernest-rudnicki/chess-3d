import { GUI } from "dat.gui";
import { Object3D } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export abstract class BaseObject extends Object3D {
  modelName: string | null = null;
  model: GLTF;

  constructor(model: string | null, debugHelper?: GUI) {
    super();
    this.modelName = model;
    const name = this.constructor.name;

    if (!debugHelper) {
      return;
    }

    if (!debugHelper.__folders[name]) {
      debugHelper.addFolder(name);
    }

    debugHelper.__folders[name].open();
    debugHelper.__folders[name].add(this.position, "x", this.position.x);
    debugHelper.__folders[name].add(this.position, "y", this.position.y);
    debugHelper.__folders[name].add(this.position, "z", this.position.z);
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
}
