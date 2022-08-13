import { Body } from "cannon-es";
import { GUI } from "dat.gui";
import { Group, Vector3 } from "three";

export abstract class BaseGroup extends Group {
  debugHelper?: GUI;
  name: string;
  body: Body;

  constructor(name: string, debugHelper?: GUI) {
    super();
    this.name = name;

    if (!debugHelper) {
      return;
    }

    this.debugHelper = debugHelper;

    if (!this.debugHelper.__folders[this.name]) {
      this.debugHelper.addFolder(this.name);
    }

    this.debugHelper.__folders[this.name].open();
  }

  setInitialDebugPosition(vector: Vector3): void {
    this.debugHelper.__folders[this.name].add(this.position, "x", vector.x);
    this.debugHelper.__folders[this.name].add(this.position, "y", vector.y);
    this.debugHelper.__folders[this.name].add(this.position, "z", vector.z);
  }
}
