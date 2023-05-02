import { Chess, ChessInstance, Move, PieceColor } from "chess.js";
import { PIECE_SQUARE_TABLES, PIECE_WEIGHTS } from "constants/chess-weights";
import { PieceSquareTables, SquareTableKeys } from "constants/types";
import cloneDeep from "lodash.clonedeep";
import { getMatrixPosition, isPromotionFlag } from "utils/chess";
import { PieceChessPosition } from "objects/Pieces/Piece/types";
import { PromotionWebWorkerEvent } from "logic/ChessGameEngine/types";
import { PieceSet } from "logic/PiecesContainer/types";

// based on https://dev.to/zeyu2001/build-a-simple-chess-ai-in-javascript-18eg
export class ChessAi {
  private color: PieceColor;
  private aiSquareTables: PieceSquareTables;
  private opponentSquareTables: PieceSquareTables;
  private chessGame: ChessInstance;
  private prevSum = 0;

  constructor() {
    this.chessGame = new Chess();
  }

  private blackStartInit(): void {
    this.aiSquareTables = this.reverseSquareTablesForBlack();
    this.opponentSquareTables = cloneDeep(PIECE_SQUARE_TABLES);
  }

  private whiteStartInit(): void {
    this.aiSquareTables = cloneDeep(PIECE_SQUARE_TABLES);
    this.opponentSquareTables = this.reverseSquareTablesForBlack();
  }

  private reverseSquareTablesForBlack(): PieceSquareTables {
    const cloned = cloneDeep(PIECE_SQUARE_TABLES);

    for (const value of Object.values(cloned)) {
      value.reverse();
    }

    return cloned;
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
    const moves = this.chessGame.moves();

    if (depth === 0 || moves.length === 0) {
      return [null, sum];
    }

    for (const moveNotation of moves) {
      currentMove = this.chessGame.move(moveNotation);
      const newSum = this.evaluateBoard(currentMove, sum);
      const [_, childValue] = this.minimax(
        depth - 1,
        newSum,
        !isMaximizingPlayer,
        alpha,
        beta
      );

      this.chessGame.undo();

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

  private evaluateBoard(move: Move, prevSum: number): number {
    let newSum = prevSum;
    const { row: fromRow, column: fromColumn } = getMatrixPosition(move.from);
    const { row: toRow, column: toColumn } = getMatrixPosition(move.to);
    const { captured, color: moveColor, flags } = move;
    let movedPiece: SquareTableKeys = move.piece;

    if (this.isEndGameKing(prevSum, movedPiece)) {
      movedPiece = "k_endGame";
    }

    if (captured) {
      if (this.isAiColor(moveColor)) {
        newSum +=
          PIECE_WEIGHTS[captured] +
          this.getOpponentValueFromSquareTable(captured, {
            row: toRow,
            column: toColumn,
          });
      } else {
        newSum -=
          PIECE_WEIGHTS[captured] +
          this.getAiValueFromSquareTable(captured, {
            row: toRow,
            column: toColumn,
          });
      }
    }

    if (isPromotionFlag(flags)) {
      const promoted = "q"; // for simplicity always promote to queen

      if (this.isAiColor(moveColor)) {
        newSum -=
          PIECE_WEIGHTS[movedPiece] +
          this.getAiValueFromSquareTable(movedPiece, {
            row: fromRow,
            column: fromColumn,
          });

        newSum +=
          PIECE_WEIGHTS[promoted] +
          this.getAiValueFromSquareTable(promoted, {
            row: fromRow,
            column: fromColumn,
          });
      } else {
        newSum +=
          PIECE_WEIGHTS[movedPiece] +
          this.getAiValueFromSquareTable(movedPiece, {
            row: fromRow,
            column: fromColumn,
          });

        newSum -=
          PIECE_WEIGHTS[promoted] +
          this.getAiValueFromSquareTable(movedPiece, {
            row: toRow,
            column: toColumn,
          });
      }
    } else {
      if (this.isAiColor(moveColor)) {
        newSum -= this.getAiValueFromSquareTable(movedPiece, {
          row: fromRow,
          column: fromColumn,
        });
        newSum += this.getAiValueFromSquareTable(movedPiece, {
          row: toRow,
          column: toColumn,
        });
      } else {
        newSum += this.getAiValueFromSquareTable(movedPiece, {
          row: fromRow,
          column: fromColumn,
        });
        newSum -= this.getAiValueFromSquareTable(movedPiece, {
          row: toRow,
          column: toColumn,
        });
      }
    }

    return newSum;
  }

  private isAiColor(color: PieceColor): boolean {
    return color === this.color;
  }

  private isEndGameKing(prevSum: number, movedPiece: keyof PieceSet): boolean {
    return prevSum < -1500 && movedPiece === "k";
  }

  private getOpponentValueFromSquareTable(
    piece: SquareTableKeys,
    chessPosition: PieceChessPosition
  ): number {
    const { row, column } = chessPosition;
    return this.opponentSquareTables[piece][row][column];
  }

  private getAiValueFromSquareTable(
    piece: SquareTableKeys,
    chessPosition: PieceChessPosition
  ): number {
    const { row, column } = chessPosition;
    return this.aiSquareTables[piece][row][column];
  }

  isWhite(): boolean {
    return this.color === "w";
  }

  isBlack(): boolean {
    return this.color === "b";
  }

  init(color: PieceColor, fen: string): void {
    this.color = color;
    this.chessGame.load(fen);

    if (this.isBlack()) {
      this.blackStartInit();
      return;
    }

    this.whiteStartInit();
  }

  updateBoardWithPlayerMove(move: Move): void {
    this.chessGame.move(move);
    this.prevSum = this.evaluateBoard(move, this.prevSum);
  }

  updateChessEngineWithPromotion(payload: PromotionWebWorkerEvent): void {
    const { move, chessNotationPos, pieceType, color } = payload;

    if (move) {
      this.chessGame.move(move);
    }

    this.chessGame.remove(chessNotationPos);
    this.chessGame.put({ type: pieceType, color }, chessNotationPos);

    // related to bug https://github.com/jhlywa/chess.js/issues/250
    this.chessGame.load(this.chessGame.fen());
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
    this.chessGame.move(move);

    return move;
  }
}
