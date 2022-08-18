import { Piece } from "../Piece/Piece";
import { PieceOptions } from "../Piece/types";
import KnightModel from "assets/Knight/Knight.glb";

export class Knight extends Piece {
  constructor(name: string, options: PieceOptions) {
    super(name, KnightModel, options);
  }
}
