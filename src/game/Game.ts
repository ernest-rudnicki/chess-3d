import { CustomLoadingManager } from "managers/LoadingManager/LoadingManager";
import { BasicScene } from "scenes/BasicScene/BasicScene";
import { ChessScene } from "scenes/ChessScene/ChessScene";
import { ReinhardToneMapping, sRGBEncoding, WebGLRenderer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GameOptions } from "./types";

/**
 * A class that is responsible for managing scenes and rendering
 * @param options initial options for development mode
 * @param options.addGridHelper if set to true creates a grid for seeing the position of objects
 * @param options.debug if set to true creates a panel with objects currently added in the scene
 */
export class Game {
  loadingManager: CustomLoadingManager;
  loader: GLTFLoader;
  renderer: WebGLRenderer;

  activeScene: BasicScene | null;

  width = window.innerWidth;
  height = window.innerHeight;

  addGridHelper: boolean;
  lightHelpers: boolean;

  resizeListener: () => void;

  constructor(options: GameOptions) {
    const { addGridHelper, lightHelpers } = options;
    this.addGridHelper = addGridHelper;
    this.lightHelpers = lightHelpers;

    this.setupLoader();
    this.setupRenderer();

    this.addListenerOnResize(this.renderer);

    this.activeScene = new ChessScene({
      renderer: this.renderer,
      loader: this.loader,
      options: {
        addGridHelper: this.addGridHelper,
        lightHelpers: this.lightHelpers,
      },
    });
  }

  private setupLoader(): void {
    this.loadingManager = new CustomLoadingManager();
    this.loader = new GLTFLoader(this.loadingManager);
  }

  private setupRenderer(): void {
    this.renderer = new WebGLRenderer({
      canvas: document.getElementById("app") as HTMLCanvasElement,
      alpha: false,
      powerPreference: "high-performance",
    });

    this.renderer.setSize(this.width, this.height);

    this.renderer.toneMapping = ReinhardToneMapping;
    this.renderer.toneMappingExposure = 3;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
  }

  private addListenerOnResize(renderer: WebGLRenderer): void {
    this.resizeListener = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", this.resizeListener, false);
  }

  init() {
    if (!this.activeScene) {
      throw Error("There is no active scene at the moment");
    }

    if (!this.activeScene.init) {
      throw Error("Every scene must be declaring init function");
    }

    this.activeScene.init();
  }

  update(): void {
    if (!this.activeScene) {
      throw Error("There is no active scene at the moment");
    }

    this.activeScene.world.fixedStep();
    this.activeScene.update();
  }

  cleanup(): void {
    window.removeEventListener("resize", this.resizeListener);
  }
}
