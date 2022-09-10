import { Piece } from "objects/Pieces/Piece/Piece";
import { PieceOptions } from "objects/Pieces/Piece/types";
import BishopModal from "assets/Bishop/Bishop.glb";

export class Bishop extends Piece {
  constructor(name: string, options: PieceOptions) {
    super(name, BishopModal, options);
  }
}
