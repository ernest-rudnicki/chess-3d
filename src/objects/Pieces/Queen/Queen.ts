import { Piece } from "../Piece/Piece";
import { PieceOptions } from "../Piece/types";
import QueenModel from "assets/Queen/Queen.glb";

export class Queen extends Piece {
  constructor(name: string, options: PieceOptions) {
    super(name, QueenModel, options);
  }
}
