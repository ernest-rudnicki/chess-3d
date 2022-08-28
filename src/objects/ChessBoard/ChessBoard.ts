import { BaseGroup } from "objects/BaseGroup/BaseGroup";
import { DroppableField } from "./types";
import { Id } from "global/types";
import { Body, Box, Vec3 } from "cannon-es";
import {
  convertCannonEsQuaternion,
  convertCannonEsVector,
  convertThreeVector,
} from "utils/general";
import {
  Box3,
  CircleGeometry,
  Color,
  FrontSide,
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  Object3D,
  PlaneGeometry,
} from "three";
import { BLACK_COLOR_FIELD, WHITE_COLOR_FIELD } from "constants/colors";

export const FIELD_NAME = "Field";

export class ChessBoard extends BaseGroup {
  private size = 8;
  private currentlyDroppable: DroppableField[] = [];

  private boardMatrix: Array<Id[]> = [];

  constructor(name: string) {
    super(name);
  }

  private createDropCircle() {
    const geometry = new CircleGeometry(0.4, 16);
    const material = new MeshLambertMaterial({ color: "orange" });
    const circle = new Mesh(geometry, material);

    return circle;
  }

  private createBoardMatrix(): void {
    this.boardMatrix = [];
    let colorBlack = true;

    for (let i = 0; i < this.size; i++) {
      this.boardMatrix.push([]);
      colorBlack = !colorBlack;

      for (let j = 0; j < this.size; j++) {
        const geometry = new PlaneGeometry(1, 1);

        const color = new Color(
          colorBlack ? BLACK_COLOR_FIELD : WHITE_COLOR_FIELD
        );
        color.convertSRGBToLinear();

        const material = new MeshPhongMaterial({
          color,
          side: FrontSide,
        });
        const plane = new Mesh(geometry, material);

        plane.userData.ground = true;
        plane.userData.droppable = false;

        plane.userData.chessPosition = { row: i, column: j };

        plane.receiveShadow = true;
        plane.position.setX(j * 1);
        plane.position.setZ(i * 1);
        plane.rotation.x = -Math.PI / 2;

        plane.name = `${FIELD_NAME}Row${i}Column${j}`;

        this.boardMatrix[i].push(plane.id);

        this.add(plane);

        colorBlack = !colorBlack;
      }
    }
  }

  private createPsychicsBody() {
    this.body = new Body({
      mass: 0,
      shape: new Box(new Vec3(this.size, this.size, this.size)),
    });
  }

  private centerMiddle(): void {
    new Box3().setFromObject(this).getCenter(this.position).multiplyScalar(-1);
  }

  markPlaneAsDroppable(row: number, column: number): void {
    const planeId = this.boardMatrix[row][column];

    const plane = this.getObjectById(planeId) as Mesh;
    plane.userData.droppable = true;

    const dropCircle = this.createDropCircle();
    dropCircle.position.copy(plane.position);
    dropCircle.rotation.copy(plane.rotation);
    dropCircle.position.setY(0.01);

    this.add(dropCircle);
    this.currentlyDroppable.push({ planeId, circleId: dropCircle.id });
  }

  clearMarkedPlanes(): void {
    this.currentlyDroppable.forEach((field) => {
      const { circleId } = field;

      const circle = this.getObjectById(circleId);
      const plane = this.getObjectById(field.planeId);
      plane.userData.droppable = false;

      this.remove(circle);
    });

    this.currentlyDroppable = [];
  }

  getFieldId(row: number, column: number): number {
    return this.boardMatrix[row][column];
  }

  getField(row: number, column: number): Object3D {
    const fieldId = this.getFieldId(row, column);

    return this.getObjectById(fieldId);
  }

  init(): Body {
    this.createBoardMatrix();
    this.centerMiddle();
    this.createPsychicsBody();

    this.body.position.copy(convertThreeVector(this.position));
    this.body.position.y = -this.size;

    this.quaternion.copy(convertCannonEsQuaternion(this.body.quaternion));

    return this.body;
  }

  update() {
    const clonedPosition = this.body.position.clone();
    clonedPosition.y = clonedPosition.y + this.size;

    this.position.copy(convertCannonEsVector(clonedPosition));
    this.quaternion.copy(convertCannonEsQuaternion(this.body.quaternion));
  }
}
