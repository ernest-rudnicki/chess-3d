import { PieceSet } from "managers/PiecesManager/types";

export type PieceWeights = {
  [key in keyof PieceSet]: number;
};

export type PieceSquareTables = {
  [key in keyof PieceSet]: number[][];
};
