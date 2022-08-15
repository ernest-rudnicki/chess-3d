import { Pawn } from "objects/Pieces/Pawn/Pawn";
import { Rook } from "objects/Pieces/Rook/Rook";

export interface PieceSet {
  pawns: Pawn[];
  rooks: Rook[];
}

export interface PiecesContainer {
  black: PieceSet;
  white: PieceSet;
}
