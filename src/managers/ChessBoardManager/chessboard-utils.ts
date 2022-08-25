import { Piece } from "objects/Pieces/Piece/Piece";
import { Object3D } from "three";
import { ChessFieldLetters } from "maps/ChessFieldLetters";
import { ChessFieldColumns } from "maps/ChessFieldColumns";

export function isPiece(object: Object3D): object is Piece {
  return !!(object as Piece).chessPosition;
}

export function getChessNotation(row: number, column: number): string {
  return `${ChessFieldLetters[column]}${row}`;
}

export function getMatrixPosition(chessNotation: string): {
  row: number;
  column: number;
} {
  if (chessNotation.length !== 2) {
    throw Error("Invalid chess notation");
  }
  const letter = chessNotation[0];
  const row = parseInt(chessNotation[1], 10);
  const column = ChessFieldColumns[letter];

  return { row, column };
}
