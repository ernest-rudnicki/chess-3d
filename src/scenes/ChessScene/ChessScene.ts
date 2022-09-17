import { PieceColor } from "chess.js";
import { isPiece } from "utils/chess";
import { ChessGameEngine } from "game-logic/ChessGameEngine/ChessGameEngine";
import { Piece } from "objects/Pieces/Piece/Piece";
import { BasicScene } from "scenes/BasicScene/BasicScene";
import { BasicSceneProps } from "scenes/BasicScene/types";
import { Raycaster, Vector2, Vector3 } from "three";
import {
  ActionResult,
  OnEndGame,
  PromotionResult,
} from "game-logic/ChessGameEngine/types";

export class ChessScene extends BasicScene {
  private chessGameEngine: ChessGameEngine;
  private raycaster: Raycaster;
  private clickPointer: Vector2;

  constructor(props: BasicSceneProps) {
    super(props);
    this.chessGameEngine = new ChessGameEngine(this.world, this.loader);
  }

  private getCoords(event: MouseEvent): { x: number; y: number } {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;

    return { x, y };
  }

  private onPointerMove = (event: MouseEvent) => {
    this.movePiece(event);
  };

  private onMouseDown = (event: MouseEvent): void => {
    const { x, y } = this.getCoords(event);
    this.clickPointer.x = x;
    this.clickPointer.y = y;

    this.selectPiece();
  };

  private onMouseUp = (): void => {
    if (!this.chessGameEngine.isAnySelected()) {
      return;
    }
    const intersects = this.raycaster.intersectObjects(this.children);
    const item = intersects.find((el) => el.object.userData.ground);

    const actionResult = this.chessGameEngine.deselect(item.object);

    if (!actionResult) {
      return;
    }

    this.onActionPerformed(actionResult);
  };

  private setupRaycaster(): void {
    this.raycaster = new Raycaster();
    this.clickPointer = new Vector2();

    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("pointermove", this.onPointerMove);
  }

  private setupLights(): void {
    this.setupLight("#FFFFFF", new Vector3(0, 8, -8), 3, new Vector3(0, 0, 0));

    this.setupLight("#FFFFFF", new Vector3(0, 13, 0), 8, new Vector3(0, 0, 0));

    this.setupLight("#FFFFFF", new Vector3(0, 8, 8), 3, new Vector3(0, 0, 0));
  }

  private setupPieces(): void {
    const pieces = this.chessGameEngine.getAllPieces();
    pieces.forEach((el: Piece) => {
      this.add(el);
    });
  }

  private setupScene(): void {
    this.add(this.chessGameEngine.chessBoard);
    this.setupPieces();
  }

  private movePiece(event: MouseEvent): void {
    if (!this.chessGameEngine.isAnySelected()) {
      return;
    }

    const { x, y } = this.getCoords(event);

    this.raycaster.setFromCamera({ x, y }, this.camera);

    const intersects = this.raycaster.intersectObjects(this.children);
    const item = intersects.find((el) => el.object.userData.ground);

    if (!item) {
      return;
    }

    this.chessGameEngine.moveSelectedPiece(item.point.x, item.point.z);
  }

  private selectPiece(): void {
    this.raycaster.setFromCamera(this.clickPointer, this.camera);

    if (this.chessGameEngine.isAnySelected()) {
      return;
    }

    const intersects = this.raycaster.intersectObjects(this.children);
    const found = intersects.find((el) => !!el.object.userData.lastParent);

    if (!found) {
      return;
    }

    const { lastParent } = found.object.userData;

    if (!lastParent || !isPiece(lastParent)) {
      return;
    }

    this.chessGameEngine.select(lastParent);
  }

  private setCameraPosition(playerStartingSide: PieceColor): void {
    const z = playerStartingSide === "w" ? -8 : 8;
    this.camera.position.set(0, 11, z);
    this.camera.lookAt(0, 0, 0);
  }

  private removePiecesFromScene(piecesIds: number[]): void {
    piecesIds.forEach((id) => {
      const pieceToRemove = this.getObjectById(id);
      this.remove(pieceToRemove);
    });
  }

  private onActionPerformed(actionResult: ActionResult): void {
    const { removedPiecesIds, promotedPiece } = actionResult;

    this.removePiecesFromScene(removedPiecesIds);

    if (!promotedPiece) {
      return;
    }

    this.add(promotedPiece);
  }

  init(): void {
    this.camera.position.set(0, 11, 8);
    this.camera.lookAt(0, 0, 0);

    this.orbitals.autoRotate = true;
    this.setupLights();
    this.setupRaycaster();
    this.chessGameEngine.init();
    this.setupScene();
  }

  start(onEndGame: OnEndGame): void {
    this.orbitals.autoRotate = false;
    const playerStartingSide = this.chessGameEngine.start(
      (actionResult: ActionResult) => {
        this.onActionPerformed(actionResult);
      },
      onEndGame,
      (promotionResult: PromotionResult) => {
        const { removedPieceId, promotedPiece } = promotionResult;
        this.onActionPerformed({
          removedPiecesIds: [removedPieceId],
          promotedPiece,
        });
      }
    );
    this.setCameraPosition(playerStartingSide);
  }

  update(): void {
    this.chessGameEngine.update();
    super.update();
  }

  cleanup(): void {
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("pointermove", this.onPointerMove);
    this.chessGameEngine.cleanup();
  }
}
