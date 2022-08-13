import { Piece } from "../Piece/Piece";
import { PieceOptions } from "../Piece/types";
import PawnModel from "assets/Pawn/Pawn.glb";
export class Pawn extends Piece {
  constructor(name: string, options: PieceOptions) {
    super(name, PawnModel, options);
  }
}
