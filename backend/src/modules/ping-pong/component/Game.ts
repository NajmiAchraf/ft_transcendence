import { Namespace } from 'socket.io';

import Player from "src/modules/ping-pong/component/Player";
import Ball from "src/modules/ping-pong/component/Ball";

import { Mode, PlayerType } from "src/modules/ping-pong/common/Common";
import Room from 'src/modules/ping-pong/Room';

export default class Game {
	player1: Player
	player2: Player
	ball: Ball

	room: Room
	server: Namespace
	pair: [string, string]

	interval: NodeJS.Timeout = null;

	start_game: number = 0;
	end_game: number = 0;
	duration_game: number = 0;

	collapsed_time: number = Date.now();
	time_status: boolean = false;
	duration: number = 1500;

	ready_player: number = 0;
	listener0: any;
	listener1: any;
	readyToPlay0: () => void;
	readyToPlay1: () => void;
	readyCanvas0: () => void;
	readyCanvas1: () => void;

	constructor(room: Room, pair: [string, string], playerType1: PlayerType, playerType2: PlayerType, mode: Mode, idRoom: string) {
		this.room = room;
		this.server = this.room.pingPongGateway.server;
		this.pair = pair;
		this.ball = new Ball(this, mode)
		this.player1 = new Player(this, "right", playerType1, mode, this.pair[0], this.pair[1])
		this.player2 = new Player(this, "left", playerType2, mode, this.pair[1], this.pair[0])

		this.readyToPlay0 = () => {
			this.ready_player++;
			if (playerType2 === 'bot') {
				this.start()
			} else if (this.ready_player === 2) {
				this.start()
			}
			console.log("ready_player " + this.ready_player);
		}
		this.readyToPlay1 = () => {
			this.ready_player++;
			if (this.ready_player === 2) {
				this.start()
			}
		}
		this.readyCanvas0 = () => {
			let msg = "room created and waiting for player 2";
			if (this.ready_player === 2 || playerType2 === 'bot')
				msg = "room created and start play";
			this.server.to(this.pair[0]).emit("roomConstruction", { message: msg, room: idRoom });
		}
		this.readyCanvas1 = () => {
			let msg = "room created and waiting for player 1";
			if (this.ready_player === 2)
				msg = "room created and start play";
			this.server.to(this.pair[1]).emit("roomConstruction", { message: msg, room: idRoom });
		}

		this.listener0 = this.server.sockets.get(this.pair[0]);
		this.listener1 = this.server.sockets.get(this.pair[1]);
		this.listener0.on("readyToPlay", this.readyToPlay0);
		this.listener0.on("readyCanvas", this.readyCanvas0);
		if (this.listener1 !== undefined) {
			this.listener1.on("readyToPlay", this.readyToPlay1);
			this.listener1.on("readyCanvas", this.readyCanvas1);
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

		this.run();
	}

	private run(): void {
		try {
			this.start_game = Date.now();
			const framePerSecond = 60;
			this.interval = setInterval(() => { this.update(); }, 1000 / framePerSecond);
		}
		catch (error) {
			throw error;
		}
	}

	stop(): void {
		this.end_game = Date.now();
		this.duration_game = Date.now() - this.start_game;
		clearInterval(this.interval);
	}

	destroy(): void {
		this.stop();

		this.listener0.off("readyToPlay", this.readyToPlay0);
		this.listener0.off("readyCanvas", this.readyCanvas0);
		if (this.listener1 !== undefined) {
			this.listener1.off("readyToPlay", this.readyToPlay1);
			this.listener1.off("readyCanvas", this.readyCanvas1);
		}

		this.player1.destroy();
		this.player2.destroy();

		delete this.room;
		delete this.server;
		delete this.pair;
		delete this.start_game;
		delete this.end_game;
		delete this.duration_game;
		delete this.collapsed_time;
		delete this.time_status;
		delete this.duration;
		delete this.ready_player;
	}
}
