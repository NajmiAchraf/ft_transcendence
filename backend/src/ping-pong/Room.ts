import Game from "./Game";
import { Mode, PlayerType } from './Common';
import { PingPongGateway } from "./ping-pong.gateway";

class Queue {
	private queue: string[] = [];

	addPlayer(player: string): [string, string] | undefined {
		if (this.queue.includes(player)) {
			console.log("Player already in the queue");
			return undefined;
		}

		this.queue.push(player);

		if (this.queue.length === 2) {
			const [player1, player2] = this.queue;
			this.queue = [];
			return [player1, player2];
		}

		return undefined;
	}

	deletePlayer(player: string): void {
		this.queue = this.queue.filter((p) => p !== player);
	}
}

export default class Room {
	room: { [key: string]: [string, string | null] } = {};
	game: { [key: string]: Game } = {};
	idRoom: number = -1;
	queue: Queue = new Queue();
	pinPongGateway: PingPongGateway;

	constructor(pinPongGateway: PingPongGateway) {
		this.pinPongGateway = pinPongGateway;
		console.log("this.pinPongGateway.server " + this.pinPongGateway.server);
	}

	getRoom(room: string): [string, string | null] {
		return this.room[room];
	}

	private createGame(queue: [string, string | null], playerType1: PlayerType, playerType2: PlayerType, mode: Mode): void {
		const idRoom = (++this.idRoom).toString();
		this.room[idRoom] = queue;

		const [player1, player2] = queue;

		this.pinPongGateway.server.to(player1).emit("dataPlayer", {
			side: "right",
			id: player1,
		});

		this.pinPongGateway.server.to(player2).emit("dataPlayer", {
			side: "left",
			id: player2,
		});

		this.pinPongGateway.server.to(queue).emit("idRoomConstruction", idRoom);

		this.game[idRoom] = new Game(this, queue, playerType1, playerType2, mode);
		this.game[idRoom].run();
	}

	addPlayer(playerId: string): string | undefined {
		if (Object.keys(this.room).find((key) => this.room[key].includes(playerId))) {
			console.log("Player already in a room");
			return undefined;
		}

		const queue = this.queue.addPlayer(playerId);

		if (queue) {
			this.createGame(queue, "player", "player", "medium");
			return (++this.idRoom).toString();
		}

		return undefined;
	}

	addPlayerAI(playerId: string, mode: Mode): string | undefined {
		if (Object.keys(this.room).find((key) => this.room[key].includes(playerId))) {
			console.log("Player already in a room");
			return undefined;
		}

		const queue: [string, string | null] = [playerId, null];

		this.createGame(queue, "player", "bot", mode);

		return (++this.idRoom).toString();
	}

	endGame(room: string, loser: number): void {
		this.pinPongGateway.server.to(this.room[room][loser]).emit("youLose");
		this.pinPongGateway.server.to(this.room[room][1 - loser]).emit("youWin");

		//! Set the state of the game {win or lose} {time} {score} {mode} {playerType}

		// Delete the game
		this.game[room].stop();
		delete this.game[room];

		// Delete the room
		delete this.room[room];
	}

	deletePlayer(player: string): void {
		const room = Object.keys(this.room).find((key) => this.room[key].includes(player));

		if (room) {
			const loser = this.room[room].indexOf(player);
			this.pinPongGateway.server.to(this.room[room][loser]).emit("idRoomDestruction");
			this.endGame(room, loser);
			console.log("Room deleted, id: " + room);
			return;
		}

		this.queue.deletePlayer(player);
		console.log("Player deleted from the queue");
	}
}
