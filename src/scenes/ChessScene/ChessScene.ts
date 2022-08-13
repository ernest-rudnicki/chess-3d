import { ChessBoardManager } from "managers/ChessBoardManager/ChessBoardManager";
import { BasicScene } from "scenes/BasicScene/BasicScene";
import { BasicSceneProps } from "scenes/BasicScene/types";
import { Vector3 } from "three";

export class ChessScene extends BasicScene {
  chessBoardManager: ChessBoardManager;

  constructor(props: BasicSceneProps) {
    super(props);
    this.chessBoardManager = new ChessBoardManager(this.world, this.loader);
  }

  setupLights() {
    this.setupLight("#FFFFFF", new Vector3(0, 1, -8), 5, new Vector3(0, 0, 0));

    this.setupLight("#FFFFFF", new Vector3(0, 13, 0), 10, new Vector3(0, 0, 0));

    this.setupLight("#FFFFFF", new Vector3(0, 1, 8), 5, new Vector3(0, 0, 0));
  }

  init(): void {
    this.setupLights();
    this.chessBoardManager.init(this);
  }

  update(): void {
    super.update();
    this.chessBoardManager.update();
  }
}
