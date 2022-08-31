import { Move } from "chess.js";

export type AiMoveCallback = (removedPiecesIds: number[]) => void;

export interface MoveResult {
  removedPiecesIds: number[];
  move: Move;
}
