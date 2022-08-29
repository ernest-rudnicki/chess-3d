import { Move, PieceColor } from "chess.js";
import { pieceSquareTables, pieceWeights } from "constants/chess-weights";
import { PieceSquareTables } from "constants/types";
import cloneDeep from "lodash.clonedeep";
import { PieceSet } from "managers/PiecesManager/types";
import { PieceChessPosition } from "objects/Pieces/Piece/types";

export class ChessAiManager {
  private color: PieceColor;
  private pieceSquareTables: PieceSquareTables;
  private opponentSquareTables: PieceSquareTables;
  private prevSum = 0;

  private reverseSquareTablesForBlack(): PieceSquareTables {
    const cloned = cloneDeep(pieceSquareTables);

    for (const value of Object.values(cloned)) {
      value.reverse();
    }

    return cloned;
  }

  init(color: PieceColor): void {
    this.color = color;

    if (this.color === "w") {
      this.pieceSquareTables = cloneDeep(pieceSquareTables);
      this.opponentSquareTables = this.reverseSquareTablesForBlack();
      return;
    }

    this.pieceSquareTables = cloneDeep(pieceSquareTables);
    this.pieceSquareTables = this.reverseSquareTablesForBlack();
  }

  private getValueFromSquareTable(
    piece: keyof PieceSet,
    row: number,
    column: number,
    opponentTurn?: boolean
  ): number {
    if (opponentTurn) {
      return this.opponentSquareTables[piece][row][column];
    }

    return this.pieceSquareTables[piece][row][column];
  }

  evaluateBoard(move: Move, from: PieceChessPosition, to: PieceChessPosition) {
    let newSum = this.prevSum;
    const { row: fromRow, column: fromColumn } = from;
    const { row: toRow, column: toColumn } = to;
    const { captured, color: moveColor, piece } = move;

    if (captured) {
      // ai captured a piece
      if (moveColor === this.color) {
        newSum +=
          pieceWeights[captured] +
          this.getValueFromSquareTable(captured, toRow, toColumn);
      }
      // player captured a piece
      else {
        newSum -=
          pieceWeights[captured] +
          this.getValueFromSquareTable(captured, toRow, toColumn, true);
      }
    }

    if (move.flags === "p") {
      // TODO when promotion implemented change it to get from function params
      const promoted = "q";

      // ai piece was promoted
      if (moveColor === this.color) {
        newSum -=
          pieceWeights[piece] +
          this.getValueFromSquareTable(piece, fromRow, fromColumn);

        newSum +=
          pieceWeights[promoted] +
          this.getValueFromSquareTable(promoted, toRow, toColumn);
      }
      // player piece was promoted
      else {
        newSum +=
          pieceWeights[piece] +
          this.getValueFromSquareTable(piece, fromRow, fromColumn, true);

        newSum -=
          pieceWeights[promoted] +
          this.getValueFromSquareTable(piece, toRow, toColumn, true);
      }
    }
    // regular move
    else {
      // if ai moves
      if (moveColor === this.color) {
        newSum -= this.getValueFromSquareTable(piece, fromRow, fromColumn);
        newSum += this.getValueFromSquareTable(piece, toRow, toColumn);
      }
      // if player moves
      else {
        newSum += this.getValueFromSquareTable(piece, fromRow, fromColumn);
        newSum -= this.getValueFromSquareTable(piece, toRow, toColumn);
      }
    }

    this.prevSum = newSum;
  }
}
