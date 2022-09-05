import { ChessInstance, Move, PieceColor, Square } from "chess.js";
import { PromotablePieces } from "managers/PiecesManager/types";
import { Piece } from "objects/Pieces/Piece/Piece";
import { Object3D } from "three";

export type AiMoveCallback = (actionResult: ActionResult) => void;

export type OnPromotion = (promotionResult: PromotionResult) => void;

export type OnEndGame = (
  chessInstance: ChessInstance,
  playerColor: PieceColor
) => void;

export interface PromotionPayload {
  color: PieceColor;
  droppedField: Object3D;
  piece: Piece;
  promotedPieceKey: PromotablePieces;
  move?: Move;
}
export interface PromotionWebWorkerEvent {
  color: PieceColor;
  pieceType: PromotablePieces;
  chessNotationPos: Square;
  move?: Move;
  type: "promote";
}

export interface InitWebWorkerEvent {
  fen: string;
  color: PieceColor;
  type: "init";
}

export interface AiMoveWebWorkerEvent {
  playerMove: Move;
  type: "aiMove";
}

export interface AiPerformedMoveWebWorkerEvent {
  aiMove: Move;
  type: "aiMovePerformed";
}

export type WebWorkerEvent =
  | { data: InitWebWorkerEvent }
  | { data: AiMoveWebWorkerEvent }
  | { data: AiPerformedMoveWebWorkerEvent }
  | {
      data: PromotionWebWorkerEvent;
    };

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
  stopAi?: boolean;
}
