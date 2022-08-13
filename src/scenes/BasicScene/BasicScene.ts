import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BasicSceneProps } from "./types";
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

/**
 * This class is a basic scene that can be extended to create scenes
 * @param renderer ThreeJS Renderer object
 * @param loader ThreeJS GLTF Loader object
 * @param options initial options for development mode
 * @param options.addGridHelper if set to true creates a grid for seeing the position of objects
 * @param debugHelper GUI object for debugging
 */
export abstract class BasicScene extends Scene {
  private _renderer: Renderer;

  loader: GLTFLoader;

  camera: PerspectiveCamera;
  orbitals: OrbitControls;
  world: World;

  lights: Array<Light> = [];

  width = window.innerWidth;
  height = window.innerHeight;

  resizeListener: () => void;

  abstract init(): void;

  constructor(props: BasicSceneProps) {
    super();
    const { renderer, loader, debugHelper, options } = props;
    const { addGridHelper } = options;

    this._renderer = renderer;
    this.setupCamera();
    this.setupLights(!!debugHelper);

    this.addWindowResizing(this.camera);

    this.loader = loader;
    this.orbitals = new OrbitControls(this.camera, this._renderer.domElement);
    this.background = new Color(0xefefef);
    this.world = new World({ gravity: new Vec3(0, -9.82, 0) });

    if (addGridHelper) {
      this.setupGridHelper();
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

  private setupCamera(): void {
    this.camera = new PerspectiveCamera(
      35,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.set(12, 12, 12);
  }

  private setupGridHelper(): void {
    this.add(new GridHelper(10, 10, "red"));
    this.add(new AxesHelper(3));
  }

  private setupLights(debug?: boolean): void {
    const light = new PointLight(0xffffff, 1);
    light.position.set(0, 6, 0);

    light.lookAt(0, 0, 0);
    this.add(light);
    this.lights.push(light);

    if (!debug) {
      return;
    }

    this.add(new PointLightHelper(light, 0.5, 0xff9900));
  }

  update(): void {
    this.camera.updateProjectionMatrix();
    this._renderer.render(this, this.camera);
    this.orbitals.update();
    this.world.fixedStep();
  }
}
