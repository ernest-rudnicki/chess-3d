import { Pawn } from "objects/Pieces/Pawn/Pawn";

export interface PieceSet {
  pawns: Pawn[];
}

export interface PiecesContainer {
  black: PieceSet;
  white: PieceSet;
}
