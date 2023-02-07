import { Body } from "cannon-es";
import { Group, Mesh } from "three";

export abstract class BaseGroup extends Group {
  name: string;
  body: Body;

  constructor(name: string) {
    super();
    this.name = name;
  }

  dispose(): void {
    this.traverse((object: Mesh) => {
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
