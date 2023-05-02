import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BasicSceneProps, LightOptions } from "./types";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { World, Vec3 } from "cannon-es";
import {
  AxesHelper,
  Color,
  GridHelper,
  Light,
  PerspectiveCamera,
  PointLight,
  PointLightHelper,
  Renderer,
  Scene,
} from "three";
import createCannonDebugger from "cannon-es-debugger";
import { OnEndGame } from "logic/ChessGameEngine/types";

export abstract class BasicScene extends Scene {
  private _renderer: Renderer;

  loader: GLTFLoader;

  camera: PerspectiveCamera;
  orbitals: OrbitControls;
  world: World;
  cannonDebugger?: ReturnType<typeof createCannonDebugger>;

  lights: Array<Light> = [];
  lightHelpers: boolean;

  width = window.innerWidth;
  height = window.innerHeight;

  resizeListener: () => void;

  abstract init(): void;
  abstract start(onEndGame: OnEndGame): void;

  constructor(props: BasicSceneProps) {
    super();
    const { renderer, loader, options } = props;
    const { addGridHelper, lightHelpers, cannonDebugger } = options;
    this.lightHelpers = lightHelpers;

    this._renderer = renderer;
    this.setupCamera();

    this.addWindowResizing(this.camera);

    this.loader = loader;
    this.orbitals = new OrbitControls(this.camera, this._renderer.domElement);
    this.orbitals.mouseButtons = {};
    this.orbitals.enableZoom = false;
    this.background = new Color(0xefefef);
    this.world = new World({ gravity: new Vec3(0, -9.82, 0) });

    this.world.allowSleep = true;

    if (addGridHelper) {
      this.setupGridHelper();
    }

    if (cannonDebugger) {
      this.setupCannonDebugger();
    }
  }

  private addWindowResizing(camera: PerspectiveCamera): void {
    this.resizeListener = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", this.resizeListener, false);
  }

  cleanup(): void {
    window.removeEventListener("resize", this.resizeListener);
  }

  setupCamera(): void {
    this.camera = new PerspectiveCamera(
      35,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 0);
  }

  setupGridHelper(): void {
    this.add(new GridHelper(10, 10, "red"));
    this.add(new AxesHelper(3));
  }

  setupCannonDebugger(): void {
    this.cannonDebugger = createCannonDebugger(this, this.world);
  }

  setupLight(options: LightOptions): void {
    const { color, intensity, lookAt, position, castShadow } = options;
    const light = new PointLight(color, intensity);
    light.position.copy(position);

    light.shadow.bias = 0.0001;
    light.shadow.mapSize.width = 1024 * 2;
    light.shadow.mapSize.height = 1024 * 2;

    if (castShadow) {
      light.castShadow = castShadow;
    }

    if (lookAt) {
      light.lookAt(lookAt);
    }

    this.add(light);
    this.lights.push(light);

    if (!this.lightHelpers) {
      return;
    }

    this.add(new PointLightHelper(light, 0.5, 0xff9900));
  }

  update(): void {
    this.orbitals.update();
    this.camera.updateProjectionMatrix();
    this._renderer.render(this, this.camera);
  }
}
