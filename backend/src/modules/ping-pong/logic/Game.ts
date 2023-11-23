import { Server } from 'socket.io';

import Player from "./Player";
import Ball from "./Ball";

import { Mode, PlayerType } from "../types/Common";
import Room from '../Room';

export default class Game {
	player1: Player
	player2: Player
	ball: Ball

	room: Room
	server: Server
	queue: [string, string]

	interval: NodeJS.Timeout = null;

	start_game: number = 0;
	end_game: number = 0;
	duration_game: number = 0;

	collapsed_time: number = Date.now();
	time_status: boolean = false;
	duration: number = 1500;

	constructor(room: Room, queue: [string, string], playerType1: PlayerType, playerType2: PlayerType, mode: Mode) {
		this.room = room;
		this.server = this.room.pingPongGateway.server;
		this.queue = queue;
		this.ball = new Ball(this, mode)
		this.player1 = new Player(this, "right", playerType1, mode, this.queue[0], this.queue[1])
		this.player2 = new Player(this, "left", playerType2, mode, this.queue[1], this.queue[0])
	}

	private check_result(): void {
		if (this.player1.score === 2) {

			const room = this.room.socketRoom(this.queue[0]);

			this.room.endGame(room, 0, false);

		} else if (this.player2.score === 2) {

			const room = this.room.socketRoom(this.queue[1]);

			this.room.endGame(room, 1, false);

		}
	}

	// control the drawing of the ball after a goal
	private update_ball(): void {
		if (this.ball.play_ball === true)
			this.ball.update();
		else {
			if (this.ball.play_ball === false && this.time_status === false) {
				this.collapsed_time = Date.now();
				this.time_status = true;
				this.server.to(this.queue).emit("drawGoal");
			}
			if (Date.now() - this.collapsed_time > this.duration) {
				this.ball.play_ball = true;
				this.time_status = false;
			}
		}
	}

	update() {
		this.update_ball()
		this.player1.update()
		this.player2.update()
		this.check_result()
	}

	run(): void {
		try {
			this.start_game = Date.now();
			const framePerSecond = 60;
			// if (this.interval)
			// 	clearInterval(this.interval);
			this.interval = setInterval(() => { this.update(); }, 1000 / framePerSecond);
		}
		catch (error) {
			throw error;
		}
	}

	stop(): void {
		this.end_game = Date.now();
		this.duration_game = Date.now() - this.start_game;
		// stop interval
		if (this.interval)
			clearInterval(this.interval);
	}
}
