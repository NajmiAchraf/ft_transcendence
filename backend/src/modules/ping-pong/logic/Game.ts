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
	pair: [string, string]

	interval: NodeJS.Timeout = null;

	start_game: number = 0;
	end_game: number = 0;
	duration_game: number = 0;

	collapsed_time: number = Date.now();
	time_status: boolean = false;
	duration: number = 1500;

	ready_player: number = 0;

	constructor(room: Room, pair: [string, string], playerType1: PlayerType, playerType2: PlayerType, mode: Mode) {
		this.room = room;
		this.server = this.room.pingPongGateway.server;
		this.pair = pair;
		this.ball = new Ball(this, mode)
		this.player1 = new Player(this, "right", playerType1, mode, this.pair[0], this.pair[1])
		this.player2 = new Player(this, "left", playerType2, mode, this.pair[1], this.pair[0])

		const player0 = this.server.sockets.sockets.get(this.pair[0]);
		const player1 = this.server.sockets.sockets.get(this.pair[1]);
		player0.on("readyToPlay", () => {
			this.ready_player++;
			if (playerType2 === 'bot') {
				this.start()
			} else if (this.ready_player === 2) {
				this.start()
			}
			console.log("ready_player " + this.ready_player);
			player0.off("readyToPlay", () => { });
		});
		player0.on("readyCanvas", () => {
			this.server.to(this.pair[0]).emit("roomConstruction");
			player0.off("readyCanvas", () => { });
		});
		if (player1 !== undefined) {
			player1.on("readyToPlay", () => {
				this.ready_player++;
				if (this.ready_player === 2) {
					this.start()
				}
				player1.off("readyToPlay", () => { });
			});
			player1.on("readyCanvas", () => {
				this.server.to(this.pair[1]).emit("roomConstruction");
				player1.off("readyCanvas", () => { });
			});
		}
	}

	private check_result(): void {
		if (this.player1.score === 10) {

			const room = this.room.socketRoom(this.pair[0]);

			this.room.endGame(room, 0, false);

		} else if (this.player2.score === 10) {

			const room = this.room.socketRoom(this.pair[1]);

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
				this.server.to(this.pair).emit("drawGoal");
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

	private start(): void {
		this.server.to(this.pair).emit("startPlay");

		setTimeout(() => {
			this.run();
		}, 3000);
	}

	private run(): void {
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
		// if (this.interval)
		clearInterval(this.interval);
		this.interval.unref();
		// delete game all object
		delete this.player1;
		delete this.player2;
		delete this.ball;
		delete this.interval;
	}
}
