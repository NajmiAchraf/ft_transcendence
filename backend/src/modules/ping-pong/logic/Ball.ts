import { Server } from "socket.io";

import Game from "./Game";
import Player, { Paddle } from "./Player";

import { vars, Mode } from "../types/Common";

export default class Ball {
	game: Game;
	server: Server;

	player1: Player;
	player2: Player;

	scale: number;

	radius: number;

	x: number;
	y: number;
	z: number;

	mode: number = 15;
	hits: number = 0;

	speed_factor: number;
	speed: number;

	velocityX: number;
	velocityY: number;

	top: number = 0;
	bottom: number = 0;
	left: number = 0;
	right: number = 0;

	play_ball: boolean = true;

	constructor(game: Game, mode: Mode) {
		this.game = game;
		this.server = game.server;
		this.player1 = this.game.player1;
		this.player2 = this.game.player2;

		this.scale = vars.scale_width;

		if (mode === "easy")
			this.mode = 20;
		else if (mode === "medium")
			this.mode = 15;
		else if (mode === "hard")
			this.mode = 10;
		else
			throw new Error("Invalid mode");

		this.radius = ((vars.width + vars.height) / 2) / this.scale;

		this.speed_factor = vars.speed_init / 10;
		this.speed = vars.speed_init;

		this.velocityX = vars.speed_init / 2;
		this.velocityY = vars.speed_init / 2;

		this.x = 0;
		this.y = 0;
		this.z = vars.z + vars.depth / 2 + this.radius / 2;

	}

	move(): void {
		this.x += this.velocityX;
		this.y += this.velocityY;
	}

	reset(): void {
		this.hits = 0;
		this.speed = vars.speed_init;
		this.velocityY = vars.speed_init / 2;

		this.x = 0;
		this.y = 0;

		this.play_ball = false;
		this.send();
	}

	choose_paddle(): Paddle {
		let paddle: Paddle;

		if (this.game.player1.paddle.side === "right") {
			paddle = (this.x > 0) ? this.game.player1.paddle : this.game.player2.paddle;
		} else {
			paddle = (this.x < 0) ? this.game.player1.paddle : this.game.player2.paddle;
		}

		return paddle;
	}

	set_coordinations_ball(): void {
		this.top = this.y + this.radius / 2 + this.velocityY;
		this.bottom = this.y - this.radius / 2 + this.velocityY;
		this.right = this.x + this.radius / 2 + this.velocityX;
		this.left = this.x - this.radius / 2 + this.velocityX;
	}

	set_coordinations_paddle(paddle: Paddle): void {
		paddle.top = paddle.y + paddle.height / 2;
		paddle.bottom = paddle.y - paddle.height / 2;
		paddle.right = paddle.x + paddle.width / 2;
		paddle.left = paddle.x - paddle.width / 2;
	}

	ball_goal_collision(): boolean {
		if (this.right >= vars.width / 2) {

			this.game.player1.score++;
			this.velocityX = -vars.speed_init / 2;
			this.reset();
			return true;

		} else if (this.left <= -vars.width / 2) {

			this.game.player2.score++;
			this.velocityX = vars.speed_init / 2;
			this.reset();
			return true;

		}
		return false;
	}

	ball_wall_collision(): boolean {
		if (this.top >= vars.height / 2 || this.bottom <= -vars.height / 2) {

			this.velocityY = -this.velocityY;
			return true;

		}

		return false;
	}

	ball_paddle_collision(paddle: Paddle): boolean {
		let hit = false;

		if (paddle.side === "left") {

			hit = this.left <= paddle.right && this.left >= paddle.right - paddle.width / 2
				&& this.bottom <= paddle.top
				&& this.top >= paddle.bottom;

		} else if (paddle.side === "right") {

			hit = this.right >= paddle.left && this.right <= paddle.left + paddle.width / 2
				&& this.bottom <= paddle.top
				&& this.top >= paddle.bottom;

		}
		if (hit) {
			let collidePoint = this.y - paddle.y;
			collidePoint = collidePoint / (paddle.height / 2);

			let angleRad = collidePoint * Math.PI / 4;
			let direction = (this.x < 0) ? 1 : -1;

			this.velocityX = direction * this.speed * Math.cos(angleRad);
			this.velocityY = this.speed * Math.sin(angleRad);

			this.speed_algorithm();
		}

		return hit;
	}

	speed_algorithm(): void {
		if (this.speed < vars.width / 50) {
			if (this.hits > this.mode) {
				this.speed += this.speed_factor;
				this.hits = 0;
			}
			else
				this.hits++;
		}
	}

	update(): void {
		if (this.play_ball) {
			let paddle: Paddle = this.choose_paddle();

			this.set_coordinations_ball();
			this.set_coordinations_paddle(paddle);

			if (this.ball_goal_collision())
				return;

			else if (this.ball_wall_collision()) { }

			else if (this.ball_paddle_collision(paddle)) { }

			this.move();
		}
		this.send();
	}

	send() {
		this.server.to(this.game.pair).emit("ball", {
			x: this.x,
			y: this.y,
			velocityX: this.velocityX,
			score1: this.game.player1.score,
			score2: this.game.player2.score,
		});
	}
}
