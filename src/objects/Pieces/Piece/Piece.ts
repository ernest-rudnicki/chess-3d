import { Body, Box, Vec3 } from "cannon-es";
import { GUI } from "dat.gui";
import { BaseObject } from "objects/BaseObject/BaseObject";
import {
  Color,
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  convertCannonEsQuaternion,
  convertCannonEsVector,
  convertThreeVector,
} from "utils/general";
import { PieceChessPosition, PieceColor, PieceOptions } from "./types";

export abstract class Piece extends BaseObject {
  chessPosition: PieceChessPosition;
  color: PieceColor;

  constructor(
    name: string,
    model: string | null,
    options: PieceOptions,
    debugHelper?: GUI
  ) {
    super(name, model, debugHelper);

    const { initialChessPosition, color } = options;

    this.chessPosition = initialChessPosition;
    this.color = color;
  }

  init(initialPosition: Vector3, loader: GLTFLoader): Body {
    this.initModel(loader).then(() => {
      this.changeMaterial();
    });

    this.createPsychicsBody(initialPosition);

    this.position.copy(initialPosition);
    this.scale.copy(new Vector3(15, 15, 15));

    this.setInitialDebugPosition(this.position);

    return this.body;
  }

  changeMaterial(): void {
    this.model.scene.traverse((o: Mesh) => {
      if (!o.isMesh) {
        return;
      }

      o.material = new MeshPhongMaterial({
        color: this.color === PieceColor.BLACK ? "#000000" : "#E7CE89",
      });
    });
  }

  createPsychicsBody(initialPosition: Vector3): void {
    this.body = new Body({
      mass: 0.1,
      position: new Vec3().copy(convertThreeVector(initialPosition)),
      shape: new Box(new Vec3(1, 0.01, 1)),
    });
  }

  update(): void {
    this.position.copy(convertCannonEsVector(this.body.position));
    this.quaternion.copy(convertCannonEsQuaternion(this.body.quaternion));
  }
}
