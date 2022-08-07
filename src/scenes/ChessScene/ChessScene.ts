import { ChessBoard } from "objects/ChessBoard/ChessBoard";
import { BasicScene } from "scenes/BasicScene/BasicScene";
import { BasicSceneProps } from "scenes/BasicScene/types";

export class ChessScene extends BasicScene {
  chessBoard: ChessBoard;
  constructor(props: BasicSceneProps) {
    super(props);
  }
  init() {
    this.chessBoard = new ChessBoard(this.subDebugHelper);
    this.chessBoard.init(this.loader);
    this.add(this.chessBoard);
  }
}
