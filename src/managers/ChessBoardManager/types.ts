import { ChessInstance, Move, PieceColor, Square } from "chess.js";
import { PromotablePieces } from "managers/PiecesManager/types";
import { Piece } from "objects/Pieces/Piece/Piece";

export type AiMoveCallback = (actionResult: ActionResult) => void;

export type OnPromotion = (promotionResult: PromotionResult) => void;

export type OnEndGame = (
  chessInstance: ChessInstance,
  playerColor: PieceColor
) => void;

export type WebWorkerEvent =
  | { data: { fen: string; color: PieceColor; type: "init" } }
  | { data: { playerMove: Move; type: "aiMove" } }
  | { data: { aiMove: Move; type: "aiMovePerformed" } }
  | {
      data: {
        color: PieceColor;
        pieceType: PromotablePieces;
        chessNotationPos: Square;
        move?: Move;
        type: "promote";
      };
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
