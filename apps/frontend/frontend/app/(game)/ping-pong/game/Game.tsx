'use client';

import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket } from "socket.io-client";

import Ball from "@/app/(game)/ping-pong/game/Ball";
import Board from "@/app/(game)/ping-pong/game/Board";
import Player from "@/app/(game)/ping-pong/game/Player";
import { vars, Side, Props, Canvas, DevMode, Scene } from '@/app/(game)/ping-pong/common/Common'


export class CanvasComponent {
	canvas: HTMLCanvasElement;
	protected renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	protected orbits: OrbitControls | undefined;

	protected composer: EffectComposer;
	protected renderPass: RenderPass;
	protected bloomPass: UnrealBloomPass;

	protected moving_camera: boolean = false;
	onWindowResize: () => void;

	devMode: DevMode;

	static assetTexture: THREE.Texture;

	mesh: THREE.Mesh | undefined;
	geometry: THREE.SphereGeometry | undefined;
	material: THREE.Material | undefined;

	constructor(canvas: HTMLCanvasElement, devMode: DevMode, scene: Scene) {
		const fov = 75;
		const planeAspectRatio = 4 / 3;

		this.devMode = devMode;
		this.canvas = canvas;
		this.renderer = this.rendererSetup(canvas);
		this.scene = this.sceneSetup(scene);
		if (scene !== "none") {
			const { mesh, geometry, material } = this.envSetup();
			this.mesh = mesh as THREE.Mesh;
			this.geometry = geometry as THREE.SphereGeometry;
			this.material = material as THREE.Material;
		}

		this.camera = this.cameraSetup(fov, planeAspectRatio, 0.1, 6000, new THREE.Vector3(0, 0, vars.height));

		if (devMode === 'all' || devMode === 'camera') {
			this.orbits = new OrbitControls(this.camera, this.renderer.domElement);
			this.orbits.update();
		}

		// Create an effect composer
		this.composer = new EffectComposer(this.renderer);

		// Add a render pass to the composer
		this.renderPass = new RenderPass(this.scene, this.camera);
		this.composer.addPass(this.renderPass);

		// Add a bloom pass to the composer
		this.bloomPass = new UnrealBloomPass(new THREE.Vector2(this.canvas.clientWidth, this.canvas.clientHeight), 0.5, 0.4, 0.85);
		this.composer.addPass(this.bloomPass);


		let overScan = () => {
			const cameraHeight = Math.tan(THREE.MathUtils.degToRad(fov / 2));
			const ratio = this.camera.aspect / planeAspectRatio;
			const newCameraHeight = cameraHeight / ratio;
			this.camera.fov = THREE.MathUtils.radToDeg(Math.atan(newCameraHeight)) * 2;
		}

		this.onWindowResize = () => {
			this.canvas.style.width = window.innerWidth + 'px';
			this.canvas.style.height = window.innerHeight + 'px';

			this.camera.aspect = window.innerWidth / window.innerHeight;

			if (this.camera.aspect > planeAspectRatio) {
				// window too narrow
				this.camera.fov = fov;
			} else {
				// window too large
				overScan();
			}

			// Update the camera
			this.camera.updateProjectionMatrix();

			// Update the pixel ratio of the renderer inside the composer
			this.renderer.setPixelRatio(window.devicePixelRatio);
			this.composer.setPixelRatio(window.devicePixelRatio);

			// Update the size of the renderer inside the composer
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.composer.setSize(window.innerWidth, window.innerHeight);

			// Update the passes in the composer
			this.renderPass.setSize(window.innerWidth, window.innerHeight);

			// Update the passes in the composer
			this.bloomPass.setSize(window.innerWidth, window.innerHeight);
		}

		// resize for PerspectiveCamera
		window.addEventListener('resize', this.onWindowResize);

		// Initial camera aspect ratio
		this.onWindowResize();

	}

	private rendererSetup(canvas: HTMLCanvasElement) {
		let renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			antialias: true,
			alpha: true,
		})
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;
		return renderer;
	}

	static async loadAsset(scene: Scene) {
		if (scene == "none")
			return;
		const hdrTextureUrl = '/assets/' + scene + '.hdr';
		const loader = new RGBELoader();
		CanvasComponent.assetTexture = await loader.loadAsync(hdrTextureUrl);
	}

	private envSetup(): { mesh: THREE.Mesh, geometry: THREE.SphereGeometry, material: THREE.Material } {
		// Create a large sphere geometry
		const geometry = new THREE.SphereGeometry(5000, 100, 100);
		// Invert the geometry on the x-axis so that all of the faces point inward
		geometry.scale(-1, 1, 1);

		// Create a basic material and set the map to our environment map
		const material = new THREE.MeshBasicMaterial({
			map: CanvasComponent.assetTexture
		});

		// rotate the sphere
		geometry.rotateZ(Math.PI / 2);

		// Create a mesh with the sphere geometry and material
		const mesh = new THREE.Mesh(geometry, material);
		this.scene.add(mesh);

		CanvasComponent.assetTexture.dispose();

		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

		return { mesh, geometry, material }
	}

	private sceneSetup(sceneTexture: Scene) {
		let scene = new THREE.Scene()
		if (sceneTexture === "none") {
			scene.background = new THREE.Color(0x1a1c26)
		}
		return scene
	}

	protected resetCamera() {
		if (this.devMode === 'all' || this.devMode === 'camera')
			return;
		if (this.moving_camera)
			return;

		this.hardResetCamera();
	}

	protected hardResetCamera() {
		if (this.devMode === 'all' || this.devMode === 'camera')
			return;
		this.camera.position.set(0, 0, vars.height)
		this.camera.lookAt(0, 0, 0)
	}

	private cameraSetup(fov: number = 75, aspect: number = this.canvas.clientWidth / this.canvas.clientHeight, near: number = 0.1, far: number = 5000, position: THREE.Vector3 = new THREE.Vector3(0, 0, 1000)): THREE.PerspectiveCamera {
		let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		camera.position.set(position.x, position.y, position.z);
		this.scene.add(camera);
		return camera;
	}

	protected render() {
		this.composer.render();
	}

	protected dispose() {
		// dispose scene sphere
		if (this.geometry)
			this.geometry.dispose();
		if (this.material)
			this.material.dispose();
		if (this.mesh)
			this.scene.remove(this.mesh);

		window.removeEventListener('resize', this.onWindowResize);

		while (this.scene.children.length > 0) {
			this.scene.remove(this.scene.children[0]);
		}

		if (this.orbits)
			this.orbits.dispose();

		// stop animation
		this.renderer.setAnimationLoop(null);
		// clear the scene
		this.scene.clear();
		// clear the canvas
		this.renderer.clear();
		// composer dispose
		this.composer.dispose();
		// remove the canvas render
		this.renderer.dispose();
		// remove the renderPass to the composer
		this.renderPass.dispose();
		// remove the bloomPass to the composer
		this.bloomPass.dispose();
		// remove the canvas render
		this.renderer.dispose();
	}
}

export default class Game extends CanvasComponent {
	board: Board;
	player1: Player;
	player2: Player;
	ball: Ball;

	getSocket: () => Socket<DefaultEventsMap, DefaultEventsMap>;
	getDataPlayer: () => any;
	getProps: () => Props;
	room: string;
	idPlayer: string | undefined = undefined;

	duration: number = 1500;

	// boolean to check done
	running: boolean = false;
	stopped: boolean = false;
	lost: boolean = false;
	winned: boolean = false;

	drawGoal: () => void;

	constructor(getSocket: () => Socket<DefaultEventsMap, DefaultEventsMap>, getProps: () => Props, getCanvas: () => Canvas, getDataPlayer: () => any) {
		vars.z = 0;
		if (!getCanvas())
			throw new Error("Canvas is not defined");
		super(getCanvas() as HTMLCanvasElement, getProps().devMode, getProps().scene);

		this.getSocket = getSocket;
		this.getDataPlayer = getDataPlayer;
		this.getProps = getProps;
		this.room = getDataPlayer().room;

		this.board = new Board(this, vars.width, vars.height, vars.depth, getProps().geometry, getProps().reflection)
		this.ball = new Ball(this, getProps().geometry)
		this.player1 = new Player(this, "right", getProps().geometry, getProps().devMode)
		this.player2 = new Player(this, "left", getProps().geometry, getProps().devMode)

		this.scene.traverse((node: THREE.Object3D) => {
			if (node instanceof THREE.Mesh && node.material instanceof THREE.MeshBasicMaterial) {
				node.material.envMap = this.scene.environment;
				node.material.needsUpdate = true;
			}
		});

		console.log("readyToPlay");
		this.drawGoal = () => {
			// move the camera to the winner side after a goal and back to the center
			if (this.ball.velocityX < 0)
				this.moveCameraSeries("left");
			else if (this.ball.velocityX > 0)
				this.moveCameraSeries("right");
		};

		this.getSocket().on("drawGoal", this.drawGoal);

		this.getSocket().emit("readyToPlay");
	}

	// entry point for the game camera move from pi/3 to pi/2
	private startCamera() {
		if (this.devMode === 'all' || this.devMode === 'camera')
			return;
		this.resetCamera();
		if (this.moving_camera)
			return;

		this.moving_camera = true;
		const start = Date.now();
		const end = start + this.duration;
		const startAngle = Math.PI;
		const endAngle = Math.PI / 2;
		const angleRange = endAngle - startAngle;

		// Use an arrow function here so that "this" refers to the Game object
		const update = () => {
			const now = Date.now();
			const fraction = (now - start) / this.duration;
			const angle = fraction * angleRange + startAngle;
			this.camera.position.z = vars.height * Math.sin(angle);
			this.camera.position.y = vars.height * Math.cos(angle);
			this.camera.lookAt(0, 0, 0);
			if (now < end) {
				requestAnimationFrame(update);
			}
			else {
				this.moving_camera = false;
				this.resetCamera();
			}
		};

		update();
	}

	// move the camera to the left or right side and go back to the center after a goal
	private moveCameraWithDirection(side: Side, moveBack: boolean) {
		const start = Date.now();
		const duration = this.duration / 2;
		const end = start + duration;
		const startAngle = moveBack ? (Math.PI * 5) / 6 : Math.PI / 2;
		const endAngle = moveBack ? (Math.PI / 2) : (Math.PI * 5) / 6;
		const angleRange = endAngle - startAngle;

		// Use an arrow function here so that "this" refers to the Game object
		const update = () => {
			const now = Date.now();
			const fraction = (now - start) / duration;
			const angle = fraction * angleRange + startAngle;
			this.camera.position.z = vars.height * Math.sin(angle);
			if (side === "left") {
				this.camera.position.x = vars.width * Math.cos(angle);
			} else {
				this.camera.position.x = -vars.width * Math.cos(angle);
			}
			this.camera.lookAt(0, 0, 0);
			if (now < end) {
				requestAnimationFrame(update);
			}
		};

		update();
	}

	private moveCameraSeries(side: Side) {
		if (this.devMode === 'all' || this.devMode === 'camera')
			return;
		if (this.moving_camera)
			return;

		this.resetCamera();
		this.moving_camera = true;

		let step = 1;
		const totalSteps = 2; // Go and back for each step
		let moveBack = false; // Start by moving forward

		const moveNextStep = () => {
			if (step <= totalSteps) {

				this.moveCameraWithDirection(side, moveBack);

				step++;
				if (step % 2 === 0) { // Switch direction every two steps
					moveBack = !moveBack;
				}
				setTimeout(moveNextStep, this.duration / 2);

			} else {

				this.moving_camera = false;
				this.resetCamera();
			}
		};

		moveNextStep();
	}

	private update() {
		this.resetCamera();
		this.ball.update();
		this.player1.update()
		this.player2.update()
		this.board.update()
		super.render()
	}

	private animate() {
		this.startCamera();
		this.update()
	}

	run() {
		if (this.running)
			return;
		this.running = true;
		this.animate();
		this.renderer.setAnimationLoop(() => {
			this.update()
		});
	}

	win() {
		if (this.winned)
			return;
		this.winned = true;
		this.board.win();
		this.hardResetCamera();
		this.ball.reset();
	}

	lose() {
		if (this.lost)
			return;
		this.lost = true;
		this.board.lose();
		this.hardResetCamera();
		this.ball.reset();
	}

	stop() {
		if (this.stopped)
			return;
		this.stopped = true;

		this.getSocket().off("drawGoal", this.drawGoal);

		this.board.dispose();
		this.ball.dispose();
		this.player1.dispose();
		this.player2.dispose();
		this.dispose();
	}
}
