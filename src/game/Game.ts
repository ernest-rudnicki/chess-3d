import { GUI } from "dat.gui";
import { LoadingManager } from "managers/LoadingManager/LoadingManager";
import { BasicScene } from "scenes/BasicScene/BasicScene";
import * as THREE from "three";
import { Renderer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GameOptions } from "./types";

/**
 * A class that is responsible for managing scenes and rendering
 * @param options initial options for development mode
 * @param options.addGridHelper if set to true creates a grid for seeing the position of objects
 * @param options.debug if set to true creates a panel with objects currently added in the scene
 */
export class Game {
  loadingManager: LoadingManager;
  loader: GLTFLoader;
  debugHelper?: GUI;
  renderer: THREE.Renderer;

  activeScene: BasicScene | null;

  width = window.innerWidth;
  height = window.innerHeight;

  addGridHelper: boolean;

  resizeListener: () => void;

  constructor(options: GameOptions) {
    const { addGridHelper, debug } = options;
    this.addGridHelper = addGridHelper;

    this.setupLoader();
    this.setupRenderer();

    this.addListenerOnResize(this.renderer);

    if (debug) {
      this.debugHelper = new GUI();
    }

    this.activeScene = new BasicScene(
      this.renderer,
      this.loader,
      { addGridHelper: this.addGridHelper },
      this.debugHelper
    );
  }

  private setupLoader() {
    this.loadingManager = new LoadingManager();
    this.loader = new GLTFLoader(this.loadingManager);
  }

  private setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("app") as HTMLCanvasElement,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
  }

  private addListenerOnResize(renderer: Renderer) {
    this.resizeListener = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", this.resizeListener, false);
  }

  update() {
    if (!this.activeScene) {
      throw Error("There is no active scene at the moment");
    }

    this.activeScene.camera.updateProjectionMatrix();
    this.renderer.render(this.activeScene, this.activeScene.camera);
    this.activeScene.orbitals.update();
  }

  cleanup() {
    window.removeEventListener("resize", this.resizeListener);
  }
}
