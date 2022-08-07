import * as THREE from "three";
import { GUI } from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MainSceneOptions } from "./types";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/**
 * This class is a basic scene that can be extended to create scenes
 * @param renderer ThreeJS Renderer object
 * @param loader ThreeJS GLTF Loader object
 * @param options initial options for development mode
 * @param options.addGridHelper if set to true creates a grid for seeing the position of objects
 * @param debugHelper GUI object for debugging
 */
export class BasicScene extends THREE.Scene {
  private _renderer: THREE.Renderer;
  private _loader: GLTFLoader;
  private _mainDebugHelper: GUI;

  subDebugHelper: GUI | null = null;

  camera: THREE.PerspectiveCamera;
  orbitals: OrbitControls;

  lights: Array<THREE.Light> = [];
  lightCount = 1;
  lightDistance = 3;

  width = window.innerWidth;
  height = window.innerHeight;

  resizeListener: () => void;

  constructor(
    renderer: THREE.Renderer,
    loader: GLTFLoader,
    options: MainSceneOptions,
    debugHelper?: GUI
  ) {
    super();
    const { addGridHelper } = options;

    this._renderer = renderer;
    this._loader = loader;
    this.setupCamera();
    this.setupLights();

    this.addWindowResizing(this.camera);

    this.orbitals = new OrbitControls(this.camera, this._renderer.domElement);
    this.background = new THREE.Color(0xefefef);

    if (addGridHelper) {
      this.setupGridHelper();
    }

    if (debugHelper) {
      this.subDebugHelper = debugHelper.addFolder(this.constructor.name);
      this.debugCamera();
      this.debugLights();
    }
  }

  private addWindowResizing(camera: THREE.PerspectiveCamera) {
    this.resizeListener = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", this.resizeListener, false);
  }

  cleanup() {
    window.removeEventListener("resize", this.resizeListener);
    this._mainDebugHelper.removeFolder(this.subDebugHelper);
  }

  private setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      35,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.set(12, 12, 12);
  }

  private setupGridHelper() {
    this.add(new THREE.GridHelper(10, 10, "red"));
    this.add(new THREE.AxesHelper(3));
  }

  private setupLights() {
    for (let i = 0; i < this.lightCount; i++) {
      const light = new THREE.PointLight(0xffffff, 1);
      const lightX =
        this.lightDistance * Math.sin(((Math.PI * 2) / this.lightCount) * i);
      const lightZ =
        this.lightDistance * Math.cos(((Math.PI * 2) / this.lightCount) * i);
      light.position.set(lightX, this.lightDistance, lightZ);

      light.lookAt(0, 0, 0);
      this.add(light);
      this.lights.push(light);
      this.add(new THREE.PointLightHelper(light, 0.5, 0xff9900));
    }
  }

  private debugCamera() {
    const cameraGroup = this.subDebugHelper.addFolder("Camera");
    cameraGroup.add(this.camera, "fov", 20, 80);
    cameraGroup.add(this.camera, "zoom", 0, 1);
    cameraGroup.open();
  }

  private debugLights() {
    const lightGroup = this.subDebugHelper.addFolder("Lights");
    for (let i = 0; i < this.lights.length; i++) {
      lightGroup.add(this.lights[i], "visible", true);
    }
    lightGroup.open();
  }
}
