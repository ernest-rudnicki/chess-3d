import { Body, Box, Vec3 } from "cannon-es";
import { BLACK_COLOR_PIECE, WHITE_COLOR_PIECE } from "constants/colors";
import { BaseObject } from "objects/BaseObject/BaseObject";
import { Color, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { convertCannonEsQuaternion, convertThreeVector } from "utils/general";
import { PieceChessPosition, PieceColor, PieceOptions } from "./types";

export abstract class Piece extends BaseObject {
  private initialMass = 0.1;
  private size: Vec3;
  private color: PieceColor;

  chessPosition: PieceChessPosition;

  constructor(name: string, model: string | null, options: PieceOptions) {
    super(name, model);

    const { initialChessPosition, color } = options;

    this.chessPosition = initialChessPosition;
    this.color = color;
  }

  private changeMaterial(): void {
    this.model.scene.traverse((o: Mesh) => {
      if (!o.isMesh) {
        return;
      }

      o.userData.lastParent = this;

      o.castShadow = true;
      o.receiveShadow = true;

      const color = new Color(
        this.color === PieceColor.BLACK ? BLACK_COLOR_PIECE : WHITE_COLOR_PIECE
      );

      color.convertSRGBToLinear();
      o.material = new MeshPhongMaterial({
        color,
      });
    });
  }

  private createPsychicsBody(initialPosition: Vector3): void {
    this.size = new Vec3(0.3, 0.5, 0.3);
    const initialBodyPosition = new Vec3().copy(
      convertThreeVector(initialPosition)
    );

    initialBodyPosition.y = initialBodyPosition.y + this.size.y;

    this.body = new Body({
      mass: this.initialMass,
      position: initialBodyPosition,
      shape: new Box(this.size),
    });

    this.body.sleepSpeedLimit = 1;
  }

  changePosition(
    chessPosition: PieceChessPosition,
    worldPosition: Vec3,
    useHeightOffset?: boolean
  ): void {
    const { x, y, z } = worldPosition;
    this.chessPosition = chessPosition;

    this.changeWorldPosition(x, y, z, useHeightOffset);
  }

  changeWorldPosition(
    x: number,
    y: number,
    z: number,
    useHeightOffset?: boolean
  ): void {
    this.body.position.x = x;
    this.body.position.y = useHeightOffset ? y + this.size.y : y;
    this.body.position.z = z;
  }

  init(initialPosition: Vector3, loader: GLTFLoader): Body {
    this.initModel(loader).then(() => {
      this.changeMaterial();
    });

    this.createPsychicsBody(initialPosition);

    this.position.copy(initialPosition);
    this.scale.set(15, 15, 15);

    return this.body;
  }

  removeMass(): void {
    this.body.mass = 0;
  }

  resetMass(): void {
    this.body.mass = this.initialMass;
  }

  update(): void {
    this.position.set(
      this.body.position.x,
      this.body.position.y - this.size.y,
      this.body.position.z
    );
    this.quaternion.copy(convertCannonEsQuaternion(this.body.quaternion));
  }
}
