import { ChessInstance, Move, PieceColor } from "chess.js";

export type AiMoveCallback = (removedPiecesIds: number[]) => void;
export type onEndGame = (
  chessInstance: ChessInstance,
  playerColor: PieceColor
) => void;

export type WebWorkerEvent =
  | { data: { fen: string; color: PieceColor; type: "init" } }
  | { data: { playerMove: Move; type: "aiMove" } }
  | { data: { aiMove: Move; type: "aiMovePerformed" } };

export interface MoveResult {
  removedPiecesIds: number[];
  move: Move;
}
