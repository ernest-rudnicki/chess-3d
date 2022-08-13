export enum PieceColor {
  WHITE,
  BLACK,
}

export interface PieceChessPosition {
  row: number;
  column: number;
}

export interface PieceOptions {
  initialChessPosition: PieceChessPosition;
  color: PieceColor;
}
