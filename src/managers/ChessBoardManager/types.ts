import { Bishop } from "objects/Bishop/Bishop";
import { King } from "objects/Pieces/King/King";
import { Knight } from "objects/Pieces/Knight/Knight";
import { Pawn } from "objects/Pieces/Pawn/Pawn";
import { Queen } from "objects/Pieces/Queen/Queen";
import { Rook } from "objects/Pieces/Rook/Rook";

// for simplicity queen and knight are also in arrays to not provide new methods for updating in scene
export interface PieceSet {
  pawns: Pawn[];
  rooks: Rook[];
  knights: Knight[];
  bishops: Bishop[];
  queen: Queen[];
  king: King[];
}

export interface PiecesContainer {
  black: PieceSet;
  white: PieceSet;
}

export interface IChessEngine {
  moves: (from?: string) => string[];
}
