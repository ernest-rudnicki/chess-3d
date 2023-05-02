import { PieceSet } from "logic/PiecesContainer/types";

export type SquareTableKeys = keyof PieceSet | "k_endGame";

export type PieceWeights = {
  [key in keyof PieceSet]: number;
} & {
  k_endGame: number;
};

export type PieceSquareTables = {
  [key in keyof PieceSet]: number[][];
} & {
  k_endGame: number[][];
};
