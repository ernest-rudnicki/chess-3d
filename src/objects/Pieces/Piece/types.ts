import { PieceColor } from "chess.js";
export interface PieceChessPosition {
  row: number;
  column: number;
}

export interface PieceOptions {
  initialChessPosition: PieceChessPosition;
  color: PieceColor;
}
