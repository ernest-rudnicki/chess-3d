import { World } from "cannon-es";
import { GUI } from "dat.gui";
import { ChessBoard } from "objects/ChessBoard/ChessBoard";
import { Pawn } from "objects/Pieces/Pawn/Pawn";
import { PieceColor } from "objects/Pieces/Piece/types";
import { Scene, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PiecesContainer } from "./types";

export class ChessBoardManager {
  chessBoard: ChessBoard;
  pieces: PiecesContainer;

  world: World;
  loader: GLTFLoader;
  debugHelper: GUI;
  blackDebugger: GUI;
  whiteDebugger: GUI;

  constructor(world: World, loader: GLTFLoader, debugHelper?: GUI) {
    this.world = world;
    this.loader = loader;

    if (debugHelper) {
      this.debugHelper = debugHelper;

      this.blackDebugger = this.debugHelper.addFolder("Black pieces");
      this.whiteDebugger = this.debugHelper.addFolder("White pieces");
    }
  }

  init(scene: Scene): void {
    this.initChessBoard(scene);
    this.initPieces(scene);
  }

  initChessBoard(scene: Scene) {
    this.chessBoard = new ChessBoard("ChessBoard", this.debugHelper);
    const chessBoardBody = this.chessBoard.init();
    scene.add(this.chessBoard);
    this.world.addBody(chessBoardBody);
  }

  initPieces(scene: Scene) {
    this.pieces = {
      black: {
        pawns: this.initPawns(PieceColor.BLACK, scene, this.blackDebugger),
      },
      white: {
        pawns: this.initPawns(PieceColor.WHITE, scene, this.whiteDebugger),
      },
    };
  }

  initPawns(color: PieceColor, scene: Scene, debugHelper?: GUI): Pawn[] {
    const pawns: Pawn[] = [];
    const name = `Pawn${color === PieceColor.BLACK ? "Black" : "White"}`;
    const row = color === PieceColor.BLACK ? 1 : 6;

    for (let i = 0; i < 8; i++) {
      const pawn = new Pawn(
        name + i,
        {
          initialChessPosition: { row: row, column: i },
          color,
        },
        debugHelper
      );

      const fieldId = this.chessBoard.boardMatrix[row][i];
      const field = this.chessBoard.getObjectById(fieldId);
      const initialPosition = new Vector3();
      field.getWorldPosition(initialPosition);

      const pawnBody = pawn.init(initialPosition, this.loader);

      scene.add(pawn);
      this.world.addBody(pawnBody);
      pawns.push(pawn);
    }
    return pawns;
  }

  updatePieces(set: keyof PiecesContainer) {
    this.pieces[set].pawns.forEach((el) => {
      el.update();
    });
  }

  update() {
    this.chessBoard.update();
    this.updatePieces("black");
    this.updatePieces("white");
  }
}
