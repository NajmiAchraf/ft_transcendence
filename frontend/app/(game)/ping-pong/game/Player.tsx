'use client';

import * as THREE from 'three'

import Game from '@/app/(game)/ping-pong/game/Game'
import { vars, Geometry, Side } from '@/app/(game)/ping-pong/common/Common'

class Paddle {
	side: Side;

	paddle: THREE.Mesh
	geometry: THREE.BoxGeometry | THREE.CapsuleGeometry
	material: THREE.Material

	game: Game;
	canvas: HTMLCanvasElement;

	scale_width: number;
	scale_height: number;

	width: number;
	height: number;
	depth: number;

	x: number = 0;
	y: number;
	z: number = 0;

	top: number = 0;
	bottom: number = 0;
	left: number = 0;
	right: number = 0;

	mouse: THREE.Vector2;
	onPaddlePositionHandler: (mouse: MouseEvent) => void;
	onOtherPlayerUpdate: (data: any) => void;

	constructor(game: Game, side: Side, _geometry: Geometry) {
		this.side = side;

		this.game = game;
		this.canvas = this.game.canvas;

		this.scale_width = vars.scale_width;
		this.scale_height = vars.scale_height;

		this.width = vars.width / this.scale_width;
		this.height = vars.height / this.scale_height;
		this.depth = this.width;

		if (this.side === "left")
			this.x = - vars.width / 2 + this.width * 2
		else if (this.side === "right")
			this.x = vars.width / 2 - this.width * 2;
		else
			throw new Error("Invalid side");
		this.y = 0;
		this.z = vars.z + vars.depth / 2 + this.depth / 2 + vars.z_glass;

		const { paddle, geometry, material } = this.paddleSetup(_geometry)
		this.paddle = paddle
		this.geometry = geometry
		this.material = material

		if (!this.canvas) {
			throw new Error("Container element not found.");
		}

		// Store a reference to the event handler function
		this.onPaddlePositionHandler = (mouse: MouseEvent) => this.paddle_position(mouse);

		this.onOtherPlayerUpdate = (data: any) => {
			this.y = data.y;
		};

		// Define a variable to store the mouse position
		this.mouse = new THREE.Vector2();

		// console.log("this.game.getDataPlayer() ", this.game.getDataPlayer())
		if (this.game.getDataPlayer().side === side)
			// Add a mouse move event listener to the container if it exists
			this.canvas.addEventListener("mousemove", this.onPaddlePositionHandler as EventListener);
		else
			// get the player coordinates with the otherID
			this.game.getSocket().on("otherPlayerUpdate", this.onOtherPlayerUpdate);
	}

	paddleSetup(_geometry: Geometry = "cube"): {
		paddle: THREE.Mesh,
		geometry: THREE.BoxGeometry | THREE.CapsuleGeometry,
		material: THREE.Material
	} {
		let geometry: THREE.BoxGeometry | THREE.CapsuleGeometry
		if (_geometry === "sphere") {
			const radius = this.width / 2;
			geometry = new THREE.CapsuleGeometry(radius, this.height - radius * 2, 16, 32);
		}
		else
			geometry = new THREE.BoxGeometry(this.width, this.height, this.depth)

		const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })

		const paddle = new THREE.Mesh(geometry, material)
		paddle.position.set(this.x, this.y, this.z)

		this.game.scene.add(paddle)

		return { paddle, geometry, material }
	}

	paddle_position(event: MouseEvent): void {
		this.mouse.x = (event.offsetX / this.canvas?.clientWidth ?? 1) * 2 - 1;
		this.mouse.y = -(event.offsetY / this.canvas?.clientHeight ?? 1) * 2 + 1;

		// Get the mouse position in the X and Y plane (ignoring Z)
		if (this.canvas) {
			const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, -1); // Z value is -1 for the desired plane
			vector.unproject(this.game.camera);

			const direction = vector.sub(this.game.camera.position).normalize();
			const distance = -this.game.camera.position.z / direction.z;

			const position = this.game.camera.position.clone().add(direction.multiplyScalar(distance));

			if (position.y + this.height / 2 > vars.height / 2) {
				this.y = vars.height / 2 - this.height / 2;
			} else if (position.y - this.height / 2 < -vars.height / 2) {
				this.y = -vars.height / 2 + this.height / 2;
			} else {
				this.y = position.y;
			}
		}

		// send the player coordinates to the other player
		this.game.getSocket().emit("playerUpdate", {
			y: this.y
		});
	}

	update(): void {
		if (this.game.getDataPlayer().side === this.side || this.game.getDataPlayer().player2Name !== "bot")
			this.paddle.position.lerp(new THREE.Vector3(this.x, this.y, this.z), 0.3)
		else if (this.game.getDataPlayer().player2Name === "bot" && this.game.ball.x < -vars.width / 3)
			this.paddle.position.lerp(new THREE.Vector3(this.x, this.y, this.z), 0.3)
	}

	dispose(): void {
		this.game.scene.remove(this.paddle);
		this.geometry.dispose();
		this.material.dispose();
		if (this.game.getDataPlayer().side === this.side)
			this.canvas.removeEventListener("mousemove", this.onPaddlePositionHandler as EventListener);
		else
			this.game.getSocket().off("otherPlayerUpdate", this.onOtherPlayerUpdate);
	}
}

export default class Player {
	paddle: Paddle;
	score: number;

	constructor(game: Game, side: Side, geometry: Geometry) {
		this.paddle = new Paddle(game, side, geometry);
		this.score = 0;
	}

	update(): void {
		this.paddle.update();
	}

	dispose(): void {
		this.paddle.dispose();
	}
}
