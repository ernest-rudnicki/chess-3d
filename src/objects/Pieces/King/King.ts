import { Piece } from "../Piece/Piece";
import { PieceOptions } from "../Piece/types";
import KingModel from "assets/King/King.glb";

export class King extends Piece {
  constructor(name: string, options: PieceOptions) {
    super(name, KingModel, options);
  }
}
