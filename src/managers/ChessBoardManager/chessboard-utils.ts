import { Piece } from "objects/Pieces/Piece/Piece";
import { Object3D } from "three";

export function isPiece(object: Object3D): object is Piece {
  return !!(object as Piece).chessPosition;
}
