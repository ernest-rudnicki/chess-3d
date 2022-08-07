import { GUI } from "dat.gui";
import { BaseObject } from "objects/BaseObject/BaseObject";
import ChessBoardModel from "assets/ChessBoard/ChessBoard.glb";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class ChessBoard extends BaseObject {
  constructor(debugHelper?: GUI) {
    super(ChessBoardModel, debugHelper);
    this.scale.multiplyScalar(20);
  }

  init(loader: GLTFLoader) {
    return super.init(loader).then((gltf) => {
      gltf.scene.traverse((el: THREE.Mesh) => {
        if (!el.isMesh) {
          return;
        }

        if (Array.isArray(el.material)) {
          return;
        }

        el.material = new THREE.MeshLambertMaterial(el.material);
      });

      return gltf;
    });
  }
}
