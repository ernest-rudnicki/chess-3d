import { Body } from "cannon-es";
import { Object3D } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export abstract class BaseObject extends Object3D {
  modelName: string | null = null;
  model: GLTF;
  name: string;
  body: Body;

  constructor(name: string, model: string | null) {
    super();
    this.modelName = model;
    this.name = name;
  }

  initModel(loader: GLTFLoader): Promise<GLTF> {
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
