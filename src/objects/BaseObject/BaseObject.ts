import { GUI } from "dat.gui";
import { Object3D } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export abstract class BaseObject extends Object3D {
  model: string | null = null;

  constructor(model: string, debugHelper?: GUI) {
    super();
    this.model = model;
    const name = this.constructor.name;

    if (!debugHelper) {
      return;
    }

    if (!debugHelper.__folders[this.name]) {
      debugHelper.addFolder(this.name);
    }

    debugHelper.__folders[name].add(this.position, "x", this.position.x);
    debugHelper.__folders[name].add(this.position, "y", this.position.y);
    debugHelper.__folders[name].add(this.position, "z", this.position.z);
    debugHelper.__folders[name].open();
  }

  init(loader: GLTFLoader): Promise<GLTF> {
    if (!this.model) {
      throw Error(
        "A 3D Object class must be provided with a path to the model."
      );
    }

    return new Promise((resolve, reject) => {
      loader.load(
        this.model,
        (gltf) => {
          this.add(gltf.scene);
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
