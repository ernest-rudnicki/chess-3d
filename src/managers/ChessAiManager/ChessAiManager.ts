import { Chess, ChessInstance, Move, PieceColor, Square } from "chess.js";
import { PIECE_SQUARE_TABLES, PIECE_WEIGHTS } from "constants/chess-weights";
import { PieceSquareTables } from "constants/types";
import cloneDeep from "lodash.clonedeep";
import { getMatrixPosition } from "utils/chess";
import { PieceSet, PromotablePieces } from "managers/PiecesManager/types";

// based on https://dev.to/zeyu2001/build-a-simple-chess-ai-in-javascript-18eg
export class ChessAiManager {
  private color: PieceColor;
  private pieceSquareTables: PieceSquareTables;
  private opponentSquareTables: PieceSquareTables;
  private chessEngine: ChessInstance;
  private prevSum = 0;

  constructor(fen: string) {
    this.chessEngine = new Chess(fen);
  }

  private reverseSquareTablesForBlack(): PieceSquareTables {
    const cloned = cloneDeep(PIECE_SQUARE_TABLES);

    for (const value of Object.values(cloned)) {
      value.reverse();
    }

    return cloned;
  }

  init(color: PieceColor): void {
    this.color = color;

    if (this.color === "b") {
      this.pieceSquareTables = cloneDeep(PIECE_SQUARE_TABLES);
      this.opponentSquareTables = this.reverseSquareTablesForBlack();
      return;
    }

    this.pieceSquareTables = cloneDeep(PIECE_SQUARE_TABLES);
    this.opponentSquareTables = this.reverseSquareTablesForBlack();
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

  private evaluateBoard(move: Move, prevSum: number): number {
    let newSum = prevSum;
    const { row: fromRow, column: fromColumn } = getMatrixPosition(move.from);
    const { row: toRow, column: toColumn } = getMatrixPosition(move.to);
    const { captured, color: moveColor, piece } = move;

    if (captured) {
      // ai captured a piece
      if (moveColor === this.color) {
        newSum +=
          PIECE_WEIGHTS[captured] +
          this.getValueFromSquareTable(captured, toRow, toColumn);
      }
      // player captured a piece
      else {
        newSum -=
          PIECE_WEIGHTS[captured] +
          this.getValueFromSquareTable(captured, toRow, toColumn, true);
      }
    }

    if (move.flags === "p") {
      const promoted = "q";

      // ai piece was promoted
      if (moveColor === this.color) {
        newSum -=
          PIECE_WEIGHTS[piece] +
          this.getValueFromSquareTable(piece, fromRow, fromColumn);

        newSum +=
          PIECE_WEIGHTS[promoted] +
          this.getValueFromSquareTable(promoted, toRow, toColumn);
      }
      // player piece was promoted
      else {
        newSum +=
          PIECE_WEIGHTS[piece] +
          this.getValueFromSquareTable(piece, fromRow, fromColumn, true);

        newSum -=
          PIECE_WEIGHTS[promoted] +
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

    return newSum;
  }

  private minimax(
    depth: number,
    sum: number,
    isMaximizingPlayer: boolean,
    alpha: number,
    beta: number
  ): [Move, number] {
    let maxVal = -Infinity;
    let bestMove: Move;
    let minVal = +Infinity;
    let currentMove: Move;
    const moves = this.chessEngine.moves();

    if (depth === 0 || moves.length === 0) {
      return [null, sum];
    }

    for (const moveNotation of moves) {
      currentMove = this.chessEngine.move(moveNotation);
      const newSum = this.evaluateBoard(currentMove, sum);
      const [_, childValue] = this.minimax(
        depth - 1,
        newSum,
        !isMaximizingPlayer,
        alpha,
        beta
      );

      this.chessEngine.undo();

      if (isMaximizingPlayer) {
        if (childValue > maxVal) {
          maxVal = childValue;
          bestMove = currentMove;
        }

        alpha = Math.max(alpha, childValue);
        if (beta <= alpha) {
          break;
        }
      } else {
        if (childValue < minVal) {
          minVal = childValue;
          bestMove = currentMove;
        }
        beta = Math.min(childValue, beta);

        if (beta <= alpha) {
          break;
        }
      }
    }

    if (isMaximizingPlayer) {
      return [bestMove, maxVal];
    }

    return [bestMove, minVal];
  }

  updateBoardWithPlayerMove(move: Move): void {
    this.chessEngine.move(move);
    this.prevSum = this.evaluateBoard(move, this.prevSum);
  }

  updateBoardWithPromotion(
    color: PieceColor,
    pieceType: PromotablePieces,
    chessNotationPos: Square,
    move?: Move
  ): void {
    if (move) {
      this.chessEngine.move(move);
    }

    this.chessEngine.remove(chessNotationPos);
    this.chessEngine.put({ type: pieceType, color }, chessNotationPos);
  }

  calcAiMove(): Move {
    const [move, sum] = this.minimax(
      3,
      this.prevSum,
      true,
      -Infinity,
      +Infinity
    );

    this.prevSum = sum;
    this.chessEngine.move(move);
    return move;
  }
}
