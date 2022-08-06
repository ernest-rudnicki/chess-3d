import * as THREE from "three";
import { GUI } from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ChessBaseModel from "../assets/King/King.glb";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export interface BasicSceneOptions {
  addGridHelper: boolean;
  debug: boolean;
}

export default class BasicScene extends THREE.Scene {
  debugger: GUI | null = null;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.Renderer;
  orbitals: OrbitControls;
  lights: Array<THREE.Light> = [];
  lightCount = 6;
  lightDistance = 3;
  width = window.innerWidth;
  height = window.innerHeight;

  constructor(options: BasicSceneOptions) {
    super();
    const { addGridHelper, debug } = options;

    this.camera = new THREE.PerspectiveCamera(
      35,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.z = 12;
    this.camera.position.y = 12;
    this.camera.position.x = 12;
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("app") as HTMLCanvasElement,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    BasicScene.addWindowResizing(this.camera, this.renderer);
    this.orbitals = new OrbitControls(this.camera, this.renderer.domElement);
    if (addGridHelper) {
      this.add(new THREE.GridHelper(10, 10, "red"));
      this.add(new THREE.AxesHelper(3));
    }
    this.background = new THREE.Color(0xefefef);
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
    if (debug) {
      this.debugger = new GUI();
      const lightGroup = this.debugger.addFolder("Lights");
      for (let i = 0; i < this.lights.length; i++) {
        lightGroup.add(this.lights[i], "visible", true);
      }
      lightGroup.open();
      const cameraGroup = this.debugger.addFolder("Camera");
      cameraGroup.add(this.camera, "fov", 20, 80);
      cameraGroup.add(this.camera, "zoom", 0, 1);
      cameraGroup.open();
    }
    const loader = new GLTFLoader();
    loader.load(ChessBaseModel, (gltf) => {
      this.add(gltf.scene);
      const chessBaseGroup = this.debugger.addFolder("Chess Base");
      chessBaseGroup.add(gltf.scene.position, "x", 0);
      chessBaseGroup.add(gltf.scene.position, "y", 0);
      chessBaseGroup.add(gltf.scene.position, "z", 0);
      chessBaseGroup.open();
    });
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
      // uses the global window widths and height
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
}
