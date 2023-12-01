'use client';

import * as THREE from 'three';

import Game from '@/app/(game)/ping-pong/game/Game'
import Player from '@/app/(game)/ping-pong/game/Player'
import { vars, Geometry } from '@/app/(game)/ping-pong/common/Common'

export default class Ball {
	game: Game;

	ball: THREE.Mesh
	geometry: THREE.BoxGeometry | THREE.SphereGeometry
	material: THREE.Material

	player1: Player;
	player2: Player;

	scale: number;

	radius: number;

	x: number;
	y: number;
	z: number;

	velocityX: number;

	onBall: (data: any) => void;

	constructor(game: Game, _geometry: Geometry) {
		this.game = game;
		this.player1 = this.game.player1;
		this.player2 = this.game.player2;

		this.scale = vars.scale_width;

		this.radius = ((vars.width + vars.height) / 2) / this.scale;

		this.velocityX = vars.speed_init / 2;
		this.x = 0;
		this.y = 0;
		this.z = vars.z + vars.depth / 2 + this.radius / 2 + vars.z_glass;

		const { ball, geometry, material } = this.ballSetup(_geometry)
		this.ball = ball
		this.geometry = geometry
		this.material = material

		this.onBall = (data: any) => {
			this.x = data.x;
			this.y = data.y;
			this.velocityX = data.velocityX;
			this.game.player1.score = data.score1;
			this.game.player2.score = data.score2;
		};

		this.game.getSocket().on("ball", this.onBall);
	}

	ballSetup(_geometry: Geometry = "cube"): {
		ball: THREE.Mesh,
		geometry: THREE.BoxGeometry | THREE.SphereGeometry,
		material: THREE.Material
	} {
		let geometry: THREE.BoxGeometry | THREE.SphereGeometry
		if (_geometry === "sphere")
			geometry = new THREE.SphereGeometry(this.radius / 2)
		else
			geometry = new THREE.BoxGeometry(this.radius, this.radius, this.radius)

		const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })

		const ball = new THREE.Mesh(geometry, material)
		ball.position.set(this.x, this.y, this.z)

		this.game.scene.add(ball)

		return { ball, geometry, material }
	}

	update() {
		this.ball.position.lerp(new THREE.Vector3(this.x, this.y, this.z), 0.3)
	}

	dispose() {
		this.game.scene.remove(this.ball)
		this.geometry.dispose()
		this.material.dispose()
		this.game.getSocket().off("ball", this.onBall);
	}
}
