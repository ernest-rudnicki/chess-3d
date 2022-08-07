import { GUI } from "dat.gui";
import * as THREE from "three";

export abstract class BaseGroup extends THREE.Group {
  constructor(debugHelper?: GUI) {
    super();
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
}
