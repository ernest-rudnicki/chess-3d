import { ChessInstance, Move, PieceColor } from "chess.js";
import { Piece } from "objects/Pieces/Piece/Piece";

export type AiMoveCallback = (actionResult: ActionResult) => void;

export type onEndGame = (
  chessInstance: ChessInstance,
  playerColor: PieceColor
) => void;

export type WebWorkerEvent =
  | { data: { fen: string; color: PieceColor; type: "init" } }
  | { data: { playerMove: Move; type: "aiMove" } }
  | { data: { aiMove: Move; type: "aiMovePerformed" } };

export interface PromotionResult {
  removedPieceId: number;
  promotedPiece: Piece;
}

export interface ActionResult {
  removedPiecesIds: number[];
  promotedPiece?: Piece;
}
export interface MoveResult extends ActionResult {
  move: Move;
}
