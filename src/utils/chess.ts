import { Piece } from "objects/Pieces/Piece/Piece";
import { Object3D } from "three";
import { ChessFieldLetters } from "maps/ChessFieldLetters";
import { ChessFieldColumns } from "maps/ChessFieldColumns";
import { PieceChessPosition } from "objects/Pieces/Piece/types";
import { PromotionResult } from "game-logic/ChessGameEngine/types";
import { Square } from "chess.js";

export function isPiece(object: Object3D): object is Piece {
  return !!(object as Piece).chessPosition;
}

export function isPromotionResult(
  result: number | boolean | PromotionResult
): result is PromotionResult {
  return (
    typeof result === "object" && !!(result as PromotionResult).promotedPiece
  );
}

export function getChessNotation(chessPosition: PieceChessPosition): Square {
  const { row, column } = chessPosition;
  return `${ChessFieldLetters[column]}${row + 1}` as Square;
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

export function isPromotionFlag(flags: string): boolean {
  return flags.includes("p");
}
