import { ChessBoardManager } from "managers/ChessBoardManager/ChessBoardManager";
import { BasicScene } from "scenes/BasicScene/BasicScene";
import { BasicSceneProps } from "scenes/BasicScene/types";

export class ChessScene extends BasicScene {
  chessBoardManager: ChessBoardManager;

  constructor(props: BasicSceneProps) {
    super(props);
    this.chessBoardManager = new ChessBoardManager(
      this.world,
      this.loader,
      this.subDebugHelper
    );
  }

  init(): void {
    this.chessBoardManager.init(this);
  }

  update(): void {
    super.update();
    this.chessBoardManager.update();
  }
}
