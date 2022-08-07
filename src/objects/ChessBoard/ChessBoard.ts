import { GUI } from "dat.gui";
import * as THREE from "three";
import { ChessField } from "./types";
import { ChessFieldLetters } from "maps/ChessFieldLetters";
import { BaseGroup } from "objects/BaseGroup/BaseGroup";

export class ChessBoard extends BaseGroup {
  boardMatrix: Array<ChessField[]>;
  width = 8;
  height = 8;

  constructor(debugHelper: GUI) {
    super(debugHelper);
  }

  init() {
    this.createBoardMatrix();
    this.centerMiddle();
  }

  createBoardMatrix(): void {
    this.boardMatrix = [];
    let colorBlack = true;

    for (let i = 0; i < 8; i++) {
      this.boardMatrix.push([]);
      colorBlack = !colorBlack;

      for (let j = 0; j < 8; j++) {
        this.boardMatrix[i].push({
          letter: ChessFieldLetters[i],
          canBeDropped: false,
        });

        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshLambertMaterial({
          color: colorBlack ? "#000000" : "#FFFFFF",
          side: THREE.DoubleSide,
        });
        const plane = new THREE.Mesh(geometry, material);

        colorBlack = !colorBlack;

        plane.position.setX(j * 1);
        plane.position.setZ(i * 1);
        plane.rotation.x = Math.PI / 2;

        this.add(plane);
      }
    }
  }

  centerMiddle() {
    new THREE.Box3()
      .setFromObject(this)
      .getCenter(this.position)
      .multiplyScalar(-1);
  }
}
