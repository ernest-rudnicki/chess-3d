import { GUI } from "dat.gui";
import { BaseObject } from "objects/BaseObject/BaseObject";
import ChessBoardModel from "assets/ChessBoard/ChessBoard.glb";

export class ChessBoard extends BaseObject {
  constructor(debugHelper?: GUI) {
    super(ChessBoardModel, debugHelper);
  }
}
