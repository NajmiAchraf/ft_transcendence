import * as THREE from 'three';

import Game from './Game'
import Player from './Player'
import { vars, Geometry } from '../common/Common'

export default class Ball {
	game: Game;

	ball: THREE.Mesh

	player1: Player;
	player2: Player;

	scale: number;

	radius: number;

	x: number;
	y: number;
	z: number;

	velocityX: number;

	play_ball: boolean = false;

	constructor(game: Game, geometry: Geometry) {
		this.game = game;
		this.player1 = this.game.player1;
		this.player2 = this.game.player2;

		this.scale = vars.scale_width;

		this.radius = ((vars.width + vars.height) / 2) / this.scale;

		this.velocityX = vars.speed_init / 2;
		this.x = 0;
		this.y = 0;
		this.z = vars.z + vars.depth / 2 + this.radius / 2 + vars.z_glass;

		this.ball = this.ballSetup(geometry)

		this.game.socket.on("ball", (data: any) => {
			this.play_ball = data.play_ball;
			this.x = data.x;
			this.y = data.y;
			this.velocityX = data.velocityX;
			this.game.player1.score = data.score1;
			this.game.player2.score = data.score2;
		});
	}

	ballSetup(_geometry: Geometry = "cube") {
		if (_geometry === "sphere") {
			let geometry = new THREE.SphereGeometry(this.radius / 2)
			let material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
			// let material = new THREE.MeshStandardMaterial({ color: 0x50f2f0 })
			let ball = new THREE.Mesh(geometry, material)
			ball.position.set(this.x, this.y, this.z)
			this.game.scene.add(ball)
			return ball
		}
		let geometry = new THREE.BoxGeometry(this.radius, this.radius, this.radius)
		let material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
		// let material = new THREE.MeshStandardMaterial({ color: 0x50f2f0 })
		let ball = new THREE.Mesh(geometry, material)
		ball.position.set(this.x, this.y, this.z)
		this.game.scene.add(ball)
		return ball
	}

	update() {
		this.ball.position.set(this.x, this.y, this.z)
	}
}
