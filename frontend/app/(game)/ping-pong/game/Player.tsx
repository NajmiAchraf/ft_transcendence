'use client';

import * as THREE from 'three'

import Game from '@/app/(game)/ping-pong/game/Game'
import { vars, Geometry, Side } from '@/app/(game)/ping-pong/common/Common'

class Paddle {
	side: Side;

	paddle: THREE.Mesh

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
	paddlePositionHandler: (mouse: MouseEvent) => void;

	constructor(game: Game, side: Side, geometry: Geometry) {
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

		this.paddle = this.paddleSetup(geometry)

		if (!this.canvas) {
			throw new Error("Container element not found.");
		}

		// Store a reference to the event handler function
		this.paddlePositionHandler = (mouse: MouseEvent) => this.paddle_position(mouse);

		// Define a variable to store the mouse position
		this.mouse = new THREE.Vector2();

		// console.log("this.game.getDataPlayer() ", this.game.getDataPlayer())
		if (this.game.getDataPlayer().side === side)
			// Add a mouse move event listener to the container if it exists
			this.canvas.addEventListener("mousemove", this.paddlePositionHandler as EventListener);
		else
			// get the player coordinates with the otherID
			this.game.getSocket().on("otherPlayerUpdate", (data: any) => {
				this.y = data.y;
				this.paddle.position.set(this.x, this.y, this.z)
			});
	}

	paddleSetup(_geometry: Geometry) {
		if (_geometry === "cube") {
			const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth)
			const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
			let paddle = new THREE.Mesh(geometry, material)
			paddle.position.set(this.x, this.y, this.z)
			this.game.scene.add(paddle)

			return paddle
		} else if (_geometry === "sphere") {
			const radius = this.width / 2;
			const geometry = new THREE.CapsuleGeometry(radius, this.height - radius * 2, 16, 32);
			const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
			let paddle = new THREE.Mesh(geometry, material);
			paddle.position.set(this.x, this.y, this.z)
			this.game.scene.add(paddle)

			return paddle
		}
		throw new Error("Invalid geometry");
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
		this.paddle.position.set(this.x, this.y, this.z)
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
}
