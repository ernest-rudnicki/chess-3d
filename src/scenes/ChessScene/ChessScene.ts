import { ChessBoard } from "objects/ChessBoard/ChessBoard";
import { BasicScene } from "scenes/BasicScene/BasicScene";
import { BasicSceneProps } from "scenes/BasicScene/types";

export class ChessScene extends BasicScene {
  chessBoard: ChessBoard;

  constructor(props: BasicSceneProps) {
    super(props);
  }

  init() {
    this.chessBoard = new ChessBoard("ChessBoard", this.subDebugHelper);
    const chessBoardBody = this.chessBoard.init();

    this.world.addBody(chessBoardBody);
    this.add(this.chessBoard);
  }

  update() {
    super.update();
    this.chessBoard.update();
  }
}
