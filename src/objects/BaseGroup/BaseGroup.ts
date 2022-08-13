import { Body } from "cannon-es";
import { Group } from "three";

export abstract class BaseGroup extends Group {
  name: string;
  body: Body;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
