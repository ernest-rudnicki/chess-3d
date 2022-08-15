import { Piece } from "../Piece/Piece";
import { PieceOptions } from "../Piece/types";
import RookModel from "assets/Rook/Rook.glb";

export class Rook extends Piece {
  constructor(name: string, options: PieceOptions) {
    super(name, RookModel, options);
  }
}
