import { ChessBoardManager } from "managers/ChessBoardManager/ChessBoardManager";
import { PiecesContainer } from "managers/ChessBoardManager/types";
import { Piece } from "objects/Pieces/Piece/Piece";
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
    this.setupLight("#FFFFFF", new Vector3(0, 6, -8), 5, new Vector3(0, 0, 0));

    this.setupLight("#FFFFFF", new Vector3(0, 13, 0), 10, new Vector3(0, 0, 0));

    this.setupLight("#FFFFFF", new Vector3(0, 6, 8), 5, new Vector3(0, 0, 0));
  }

  init(): void {
    this.setupLights();
    this.chessBoardManager.init();

    this.setupScene();
  }

  setupPieceSet(set: keyof PiecesContainer): void {
    const pieceSet = this.chessBoardManager.pieces[set];

    for (const pieces of Object.values(pieceSet)) {
      pieces.forEach((el: Piece) => {
        this.add(el);
      });
    }
  }

  setupScene(): void {
    this.add(this.chessBoardManager.chessBoard);
    this.setupPieceSet("white");
    this.setupPieceSet("black");
  }

  update(): void {
    super.update();
    this.chessBoardManager.update();
  }
}
