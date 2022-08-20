import { Bishop } from "objects/Bishop/Bishop";
import { Knight } from "objects/Pieces/Knight/Knight";
import { Pawn } from "objects/Pieces/Pawn/Pawn";
import { Rook } from "objects/Pieces/Rook/Rook";

export interface PieceSet {
  pawns: Pawn[];
  rooks: Rook[];
  knights: Knight[];
  bishops: Bishop[];
}

export interface PiecesContainer {
  black: PieceSet;
  white: PieceSet;
}
