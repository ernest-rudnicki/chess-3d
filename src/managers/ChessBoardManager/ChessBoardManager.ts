import { World } from "cannon-es";
import { ChessBoard } from "objects/ChessBoard/ChessBoard";
import { Pawn } from "objects/Pieces/Pawn/Pawn";
import { Piece } from "objects/Pieces/Piece/Piece";
import { PieceColor } from "objects/Pieces/Piece/types";
import { Rook } from "objects/Pieces/Rook/Rook";
import { Scene, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PiecesContainer } from "./types";

export class ChessBoardManager {
  chessBoard: ChessBoard;
  pieces: PiecesContainer;

  world: World;
  loader: GLTFLoader;

  constructor(world: World, loader: GLTFLoader) {
    this.world = world;
    this.loader = loader;
  }

  init(scene: Scene): void {
    this.initChessBoard(scene);
    this.initPieces(scene);
  }

  initChessBoard(scene: Scene) {
    this.chessBoard = new ChessBoard("ChessBoard");
    const chessBoardBody = this.chessBoard.init();
    scene.add(this.chessBoard);
    this.world.addBody(chessBoardBody);
  }

  concatPieceName(name: string, color: PieceColor): string {
    return `${name}${color === PieceColor.BLACK ? "Black" : "White"}`;
  }

  getMajorPieceInitialRow(color: PieceColor): number {
    return color === PieceColor.BLACK ? 0 : 7;
  }

  getFieldPosition(row: number, column: number): Vector3 {
    const fieldId = this.chessBoard.boardMatrix[row][column];
    const field = this.chessBoard.getObjectById(fieldId);
    const position = new Vector3();

    field.getWorldPosition(position);

    return position;
  }

  setupPieceInScene(
    piece: Piece,
    row: number,
    column: number,
    scene: Scene
  ): void {
    const initialPosition = this.getFieldPosition(row, column);
    const rookBody = piece.init(initialPosition, this.loader);

    scene.add(piece);
    this.world.addBody(rookBody);
  }

  initPawns(color: PieceColor, scene: Scene): Pawn[] {
    const pawns: Pawn[] = [];
    const name = this.concatPieceName("Pawn", color);
    const row = color === PieceColor.BLACK ? 1 : 6;

    for (let i = 0; i < 8; i++) {
      const pawn = new Pawn(name + i, {
        initialChessPosition: { row, column: i },
        color,
      });

      this.setupPieceInScene(pawn, row, i, scene);
      pawns.push(pawn);
    }
    return pawns;
  }

  createRook(color: PieceColor, column: number, scene: Scene): Rook {
    const name = this.concatPieceName("Rook", color);
    const row = this.getMajorPieceInitialRow(color);

    const rook = new Rook(name, {
      initialChessPosition: { row, column },
      color,
    });

    this.setupPieceInScene(rook, row, column, scene);
    return rook;
  }

  initRooks(color: PieceColor, scene: Scene): Rook[] {
    const rooks: Rook[] = [];

    rooks.push(this.createRook(color, 0, scene));
    rooks.push(this.createRook(color, 7, scene));

    return rooks;
  }

  initPieces(scene: Scene): void {
    this.pieces = {
      black: {
        pawns: this.initPawns(PieceColor.BLACK, scene),
        rooks: this.initRooks(PieceColor.BLACK, scene),
      },
      white: {
        pawns: this.initPawns(PieceColor.WHITE, scene),
        rooks: this.initRooks(PieceColor.WHITE, scene),
      },
    };
  }

  updatePieces(set: keyof PiecesContainer): void {
    for (const pieceSet of Object.values(this.pieces[set])) {
      pieceSet.forEach((el: Piece) => el.update());
    }
  }

  update(): void {
    this.chessBoard.update();
    this.updatePieces("black");
    this.updatePieces("white");
  }
}
