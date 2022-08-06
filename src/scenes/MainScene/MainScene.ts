import * as THREE from "three";
import { GUI } from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MainSceneOptions } from "./types";

export class MainScene extends THREE.Scene {
  debugger: GUI | null = null;

  camera: THREE.PerspectiveCamera;
  renderer: THREE.Renderer;
  orbitals: OrbitControls;
  loader: GLTFLoader;

  lights: Array<THREE.Light> = [];
  lightCount = 6;
  lightDistance = 3;

  width = window.innerWidth;
  height = window.innerHeight;

  constructor(options: MainSceneOptions) {
    super();
    const { addGridHelper, debug } = options;

    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    MainScene.addWindowResizing(this.camera, this.renderer);

    this.orbitals = new OrbitControls(this.camera, this.renderer.domElement);
    this.loader = new GLTFLoader();
    this.background = new THREE.Color(0xefefef);

    if (addGridHelper) {
      this.setupGridHelper();
    }

    if (debug) {
      this.debugger = new GUI();
      this.debugCamera();
      this.debugLights();
    }
  }

  /**
   * Given a ThreeJS camera and renderer, resizes the scene if the
   * browser window is resized.
   * @param camera - a ThreeJS PerspectiveCamera object.
   * @param renderer - a subclass of a ThreeJS Renderer object.
   */
  static addWindowResizing(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.Renderer
  ) {
    window.addEventListener("resize", onWindowResize, false);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
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

  private setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("app") as HTMLCanvasElement,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
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
    const cameraGroup = this.debugger.addFolder("Camera");
    cameraGroup.add(this.camera, "fov", 20, 80);
    cameraGroup.add(this.camera, "zoom", 0, 1);
    cameraGroup.open();
  }

  private debugLights() {
    const lightGroup = this.debugger.addFolder("Lights");
    for (let i = 0; i < this.lights.length; i++) {
      lightGroup.add(this.lights[i], "visible", true);
    }
    lightGroup.open();
  }
}
