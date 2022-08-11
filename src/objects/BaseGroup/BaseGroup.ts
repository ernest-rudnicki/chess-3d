import { Body } from "cannon-es";
import { GUI } from "dat.gui";
import * as THREE from "three";

export abstract class BaseGroup extends THREE.Group {
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

  setInitialDebugPosition(vector: THREE.Vector3): void {
    this.debugHelper.__folders[this.name].add(this.position, "x", vector.x);
    this.debugHelper.__folders[this.name].add(this.position, "y", vector.y);
    this.debugHelper.__folders[this.name].add(this.position, "z", vector.z);
  }
}
