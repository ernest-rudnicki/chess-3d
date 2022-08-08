import { GUI } from "dat.gui";
import * as THREE from "three";
import { BaseGroup } from "objects/BaseGroup/BaseGroup";
import { DroppableField } from "./types";
import { Id } from "global/types";

export class ChessBoard extends BaseGroup {
  boardMatrix: Array<Id[]> = [];
  currentlyDroppable: DroppableField[] = [];
  width = 8;
  height = 8;

  constructor(name: string, debugHelper: GUI) {
    super(name, debugHelper);
  }

  init(): void {
    this.createBoardMatrix();
    this.centerMiddle();
    this.setInitialDebugPosition(this.position);
  }

  createBoardMatrix(): void {
    this.boardMatrix = [];
    let colorBlack = true;

    for (let i = 0; i < 8; i++) {
      this.boardMatrix.push([]);
      colorBlack = !colorBlack;

      for (let j = 0; j < 8; j++) {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshLambertMaterial({
          color: colorBlack ? "#000000" : "#FFFFFF",
          side: THREE.FrontSide,
        });
        const plane = new THREE.Mesh(geometry, material);

        plane.position.setX(j * 1);
        plane.position.setZ(i * 1);
        plane.rotation.x = -Math.PI / 2;

        this.boardMatrix[i].push(plane.id);

        this.add(plane);

        colorBlack = !colorBlack;
      }
    }
  }

  markPlaneAsDroppable(row: number, column: number) {
    const planeId = this.boardMatrix[row][column];

    if (!planeId) {
      throw Error("There is no plane with specified row and column");
    }

    const plane = this.getObjectById(planeId) as THREE.Mesh;

    if (!plane) {
      throw Error("There is no plane with specified id");
    }

    const dropCircle = this.createDropCircle();
    dropCircle.position.copy(plane.position);
    dropCircle.rotation.copy(plane.rotation);
    dropCircle.position.setY(0.01);

    this.add(dropCircle);
    this.currentlyDroppable.push({ planeId, circleId: dropCircle.id });
  }

  createDropCircle() {
    const geometry = new THREE.CircleGeometry(0.3, 16);
    const material = new THREE.MeshLambertMaterial({ color: "gray" });
    const circle = new THREE.Mesh(geometry, material);

    return circle;
  }

  centerMiddle(): void {
    new THREE.Box3()
      .setFromObject(this)
      .getCenter(this.position)
      .multiplyScalar(-1);
  }
}
