import { isPiece } from "managers/ChessBoardManager/chessboard-utils";
import { ChessBoardManager } from "managers/ChessBoardManager/ChessBoardManager";
import { PiecesContainer } from "managers/ChessBoardManager/types";
import { FIELD_NAME } from "objects/ChessBoard/ChessBoard";
import { Piece } from "objects/Pieces/Piece/Piece";
import { BasicScene } from "scenes/BasicScene/BasicScene";
import { BasicSceneProps } from "scenes/BasicScene/types";
import {
  Color,
  Mesh,
  MeshPhongMaterial,
  Raycaster,
  Vector2,
  Vector3,
} from "three";

export class ChessScene extends BasicScene {
  chessBoardManager: ChessBoardManager;

  raycaster: Raycaster;
  pointer: Vector2;

  constructor(props: BasicSceneProps) {
    super(props);
    this.chessBoardManager = new ChessBoardManager(this.world, this.loader);
  }

  onPointerMove = (event: MouseEvent): void => {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (!this.chessBoardManager.selected) {
      return;
    }
  };

  onMouseDown = (event: MouseEvent): void => {
    this.onPointerMove(event);
    this.updateRaycaster();

    window.addEventListener("pointermove", this.onPointerMove);
  };

  onMouseUp = (): void => {
    window.removeEventListener("pointermove", this.onPointerMove);
  };

  setupRaycaster(): void {
    this.raycaster = new Raycaster();
    this.pointer = new Vector2();

    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
  }

  setupLights(): void {
    this.setupLight("#FFFFFF", new Vector3(0, 8, -8), 5, new Vector3(0, 0, 0));

    this.setupLight("#FFFFFF", new Vector3(0, 13, 0), 10, new Vector3(0, 0, 0));

    this.setupLight("#FFFFFF", new Vector3(0, 8, 8), 5, new Vector3(0, 0, 0));
  }

  init(): void {
    this.setupLights();
    this.chessBoardManager.init();
    this.setupRaycaster();

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

  updateRaycaster(): void {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.children);
    const { lastParent } = intersects[0].object.userData;

    if (lastParent && !isPiece(lastParent)) {
      return;
    }

    this.chessBoardManager.selected = lastParent;
  }

  update(): void {
    this.chessBoardManager.update();
    super.update();
  }

  cleanup(): void {
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
  }
}
