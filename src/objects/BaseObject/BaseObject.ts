import { Body } from "cannon-es";
import { Mesh, Object3D } from "three";
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

  dispose(): void {
    this.model.scene.traverse((object: Mesh) => {
      if (!object) {
        return;
      }

      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        if ((<any>object.material).map) {
          (<any>object.material).map.dispose();
        }

        (<any>object.material).dispose();
      }
    });
  }
}
