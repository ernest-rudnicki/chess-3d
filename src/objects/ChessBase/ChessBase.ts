import { BaseObject } from "objects/BaseObject/BaseObject";
import ChessBaseModel from "assets/ChessBase/ChessBase.glb";

export class ChessBase extends BaseObject {
  constructor(name: string) {
    super(name, ChessBaseModel);
  }
}
