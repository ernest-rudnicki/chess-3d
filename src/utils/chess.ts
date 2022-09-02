import { Piece } from "objects/Pieces/Piece/Piece";
import { Object3D } from "three";
import { ChessFieldLetters } from "maps/ChessFieldLetters";
import { ChessFieldColumns } from "maps/ChessFieldColumns";
import { PieceChessPosition } from "objects/Pieces/Piece/types";

export function isPiece(object: Object3D): object is Piece {
  return !!(object as Piece).chessPosition;
}

export function getChessNotation(chessPosition: PieceChessPosition): string {
  const { row, column } = chessPosition;
  return `${ChessFieldLetters[column]}${row + 1}`;
}

export function getMatrixPosition(chessNotation: string): PieceChessPosition {
  if (chessNotation.length > 2) {
    console.error("Chess notation cannot be longer than 2");
    return;
  }

  const letter = chessNotation[0];
  const row = parseInt(chessNotation[1], 10) - 1;
  const column = ChessFieldColumns[letter];

  return { row, column };
}
