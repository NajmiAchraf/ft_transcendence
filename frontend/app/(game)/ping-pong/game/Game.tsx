'use client';

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket } from "socket.io-client";

import Ball from "@/app/(game)/ping-pong/game/Ball";
import Board from "@/app/(game)/ping-pong/game/Board";
import Player from "@/app/(game)/ping-pong/game/Player";
import { vars, Side, Props, Canvas } from '@/app/(game)/ping-pong/common/Common'


class CanvasComponent {
	canvas: HTMLCanvasElement
	renderer: THREE.WebGLRenderer
	scene: THREE.Scene
	camera: THREE.PerspectiveCamera

	composer: EffectComposer;
	renderPass: RenderPass;
	bloomPass: UnrealBloomPass;

	moving_camera: boolean = false;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas
		this.renderer = this.rendererSetup(canvas)
		this.scene = this.sceneSetup()
		this.camera = this.cameraSetup(75, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 5000, new THREE.Vector3(0, 0, vars.height))

		// resize for PerspectiveCamera
		window.addEventListener('resize', () => {
			if (screen.orientation?.type === 'landscape-primary' || screen.orientation?.type === 'landscape-secondary') {
				this.canvas.style.width = window.innerWidth + 'px';
				this.canvas.style.height = window.innerHeight + 'px';
			} else {
				this.canvas.style.width = window.innerHeight + 'px';
				this.canvas.style.height = window.innerWidth + 'px';
			}
			this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
			this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
			this.camera.updateProjectionMatrix();
		});

		// Create an effect composer
		this.composer = new EffectComposer(this.renderer);

		// Add a render pass to the composer
		this.renderPass = new RenderPass(this.scene, this.camera);
		this.composer.addPass(this.renderPass);

		// Add a bloom pass to the composer
		this.bloomPass = new UnrealBloomPass(new THREE.Vector2(this.canvas.clientWidth, this.canvas.clientHeight), 0.5, 0.4, 0.85);
		this.composer.addPass(this.bloomPass);

	}


	private rendererSetup(canvas: HTMLCanvasElement) {
		let renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			antialias: true,
			alpha: true,
		})
		renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.shadowMap.enabled = true;
		//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		return renderer
	}

	private sceneSetup() {
		let scene = new THREE.Scene()
		scene.background = new THREE.Color(0x1a1c26)
		return scene
	}

	protected resetCamera() {
		if (this.moving_camera)
			return;

		this.hardResetCamera();
	}

	protected hardResetCamera() {
		this.camera.position.set(0, 0, vars.height)
		this.camera.lookAt(0, 0, 0)
	}

	private cameraSetup(fov: number = 75, aspect: number = this.canvas.clientWidth / this.canvas.clientHeight, near: number = 0.1, far: number = 5000, position: THREE.Vector3 = new THREE.Vector3(0, 0, 1000)): THREE.PerspectiveCamera {
		let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(fov, aspect, near, far)
		camera.position.set(position.x, position.y, position.z)
		this.scene.add(camera)
		return camera
	}

	protected render() {
		this.composer.render();
		// this.renderer.render(this.scene, this.camera)
	}


}

export default class Game extends CanvasComponent {
	board: Board
	player1: Player
	player2: Player
	ball: Ball

	// service: SocketService;
	getSocket: () => Socket<DefaultEventsMap, DefaultEventsMap>;
	getDataPlayer: () => any;
	room: string;
	idPlayer: string | undefined = undefined;

	duration: number = 1500;

	constructor(getSocket: () => Socket<DefaultEventsMap, DefaultEventsMap>, getProps: () => Props, getCanvas: () => Canvas, getDataPlayer: () => any) {
		if (!getCanvas())
			throw new Error("Canvas is not defined");
		super(getCanvas() as HTMLCanvasElement)

		// this.service = service;
		this.getSocket = getSocket;
		this.getDataPlayer = getDataPlayer;
		this.room = getDataPlayer().room;

		this.board = new Board(this, vars.width, vars.height, vars.depth, getProps().geometry, getProps().mirror)
		this.ball = new Ball(this, getProps().geometry)
		this.player1 = new Player(this, "right", getProps().geometry)
		this.player2 = new Player(this, "left", getProps().geometry)

		console.log("readyToPlay");
		this.getSocket().on("drawGoal", () => {
			// move the camera to the winner side after a goal and back to the center
			if (this.ball.velocityX < 0)
				this.moveCameraSeries("left");
			else if (this.ball.velocityX > 0)
				this.moveCameraSeries("right");

		});

		this.getSocket().emit("readyToPlay");
	}

	// entry point for the game camera move from pi/3 to pi/2
	private startCamera() {
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
				super.resetCamera();
			}
		};

		update();

	}

	// move the camera to the left or right side after a goal and go back to the center after a goal
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
				super.resetCamera();
			}
		};

		moveNextStep();
	}

	private update() {
		this.resetCamera()
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
		this.animate();
		this.renderer.setAnimationLoop(() => {
			this.update()
		});
	}

	win() {
		this.board.win();
		this.hardResetCamera();
		// last update
		this.update();
		// stop animation
		this.renderer.setAnimationLoop(null);
	}

	lose() {
		this.board.lose();
		this.hardResetCamera();
		// last update
		this.update();
		// stop animation
		this.renderer.setAnimationLoop(null);
	}

	stop() {
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
		// Loop over all children of the scene
		// this.scene.traverse((object) => {
		// 	if (!object.isMesh) return;

		// 	if (object.geometry) {
		// 		object.geometry.dispose();
		// 	}

		// 	if (object.material) {
		// 		if (Array.isArray(object.material)) {
		// 			object.material.map((material) => material.dispose());
		// 		} else {
		// 			object.material.dispose();
		// 		}
		// 	}
		// });
	}
}
