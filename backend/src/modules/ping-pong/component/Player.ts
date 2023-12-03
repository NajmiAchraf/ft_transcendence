import Ball from "src/modules/ping-pong/component/Ball";
import Game from "src/modules/ping-pong/component/Game";

import { Mode, PlayerType, Side, vars } from "src/modules/ping-pong/common/Common";

export class Paddle {
	side: Side;

	game: Game;

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

	playerType: PlayerType;
	myID: string;
	otherID: string;

	listener: any;
	playerUpdate: (data: { y: number }) => void;

	constructor(game: Game, side: Side, playerType: PlayerType, myID: string, otherID: string) {
		this.side = side;

		this.game = game;
		this.playerType = playerType;
		this.myID = myID;
		this.otherID = otherID;

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
		this.z = vars.z + vars.depth / 2 + this.depth / 2;

		this.playerUpdate = (data: { y: number }) => {
			this.y = data.y;
		}

		if (this.myID !== 'bot') {
			this.listener = this.game.server.sockets.sockets.get(this.myID);
			this.listener.on("playerUpdate", this.playerUpdate);
		}

	}

	update(): void {
		// send my coordinates to the other player
		if (this.otherID !== null)
			this.game.server.to(this.otherID).emit("otherPlayerUpdate", {
				y: this.y,
			});
	}

	destroy(): void {
		if (this.myID !== 'bot') {
			this.listener.off("playerUpdate", this.playerUpdate);
		}
	}
}

class Bot extends Paddle {
	ball: Ball;
	velocityX: number;
	contact: number;
	mode: Mode = "medium";

	constructor(game: Game, side: Side, playerType: PlayerType, mode: Mode, myID: string, otherID: string) {
		super(game, side, playerType, myID, otherID);

		this.ball = game.ball;
		this.velocityX = this.ball.velocityX;
		this.contact = 0;
		if (mode === "easy" || mode === "medium" || mode === "hard")
			this.mode = mode;
		this.contact_algorithm();
	}

	contact_algorithm(): void {
		const ball_diameter = this.ball.diameter;
		const random = Math.random();
		if (this.mode === "easy")
			this.contact = random * ((this.height / 2 + ball_diameter / 2) * 1.3);
		else if (this.mode === "medium")
			this.contact = random * ((this.height / 2 + ball_diameter / 2) * 1.2);
		else if (this.mode === "hard")
			this.contact = random * ((this.height / 2 + ball_diameter / 2) * 1.1);
		// positive or negative
		if (random > 0.5)
			this.contact = -this.contact;
	}

	auto_paddle_position(): void {

		if (this.velocityX !== this.ball.velocityX) {
			this.velocityX = this.ball.velocityX;
			this.contact_algorithm();
		}

		const position = this.ball.y + this.contact;

		if (position + this.height / 2 > vars.height / 2) {
			this.y = vars.height / 2 - this.height / 2;
		} else if (position - this.height / 2 < -vars.height / 2) {
			this.y = -vars.height / 2 + this.height / 2;
		} else {
			this.y = position;
		}
	}

	update(): void {
		this.auto_paddle_position();
		super.update();
	}
}

export default class Player {
	paddle: Paddle;
	score: number;

	constructor(game: Game, side: Side, playerType: PlayerType, mode: Mode, myID: string, otherID: string) {
		if (playerType === "player")
			this.paddle = new Paddle(game, side, playerType, myID, otherID);
		else if (playerType === "bot")
			this.paddle = new Bot(game, side, playerType, mode, myID, otherID);
		else
			throw new Error("Invalid type");
		this.score = 0;
	}

	update(): void {
		this.paddle.update();
	}

	destroy(): void {
		this.paddle.destroy();
	}
}
