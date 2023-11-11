import Game from "./Game";
import { Mode } from './Common';

import { PingPongGateway } from "./ping-pong.gateway";

class Queue {
	queue: string[];
	constructor() {
		this.queue = [];
	}

	addPlayer(player): [string, string] {
		if (this.queue.includes(player)) {
			console.log("Player already in the queue");
			return undefined;
		}
		this.queue.push(player);
		if (this.queue.length === 2) {

			let q: [string, string] = [this.queue[0], this.queue[1]];

			this.queue = [];
			return q;
		}
		return undefined;
	}

	deletePlayer(player): void {
		this.queue = this.queue.filter((p) => p !== player);
	}
}

export default class Room {
	room: { [key: string]: [player1: string, player2: string | null] };
	private queue: Queue;
	private game: { [key: string]: Game }
	private idRoom: number = -1;
	pinPongGateway: PingPongGateway;

	constructor(pinPongGateway: PingPongGateway) {
		this.room = {};
		this.game = {};
		this.queue = new Queue();
		this.pinPongGateway = pinPongGateway;
		console.log("this.pinPongGateway.server " + this.pinPongGateway.server)
	}

	getRoom(room: string): [string, string | null] {
		return this.room[room];
	}

	addPlayer(playerId: string) {
		// check if the player is already in some room
		if (Object.keys(this.room).find((key) => this.room[key].includes(playerId))) {
			console.log("Player already in a room");
			return undefined;
		}
		const queue = this.queue.addPlayer(playerId);
		if (queue) {

			this.idRoom++;
			const idRoom = this.idRoom.toString();
			this.room[idRoom] = queue;

			this.pinPongGateway.server.to(queue[0]).emit("dataPlayer", {
				side: "right",
				id: queue[0],
			});
			this.pinPongGateway.server.to(queue[1]).emit("dataPlayer", {
				side: "left",
				id: queue[1],
			});

			this.pinPongGateway.server.to(queue).emit("idRoomConstruction", idRoom);
			this.game[idRoom] = new Game(this, queue, "player", "player", "medium");
			this.game[idRoom].run();
			return idRoom;
		}
		return undefined;
	}

	addPlayerAI(playerId: string, mode: Mode) {
		// check if the player is already in some room
		if (Object.keys(this.room).find((key) => this.room[key].includes(playerId))) {
			console.log("Player already in a room");
			return undefined;
		}
		let queue: [string, string] = [playerId, null];

		this.idRoom++;
		const idRoom = this.idRoom.toString();
		this.room[idRoom] = queue;

		this.pinPongGateway.server.to(queue[0]).emit("dataPlayer", {
			side: "right",
			id: queue[0],
		});

		this.pinPongGateway.server.to(queue[0]).emit("idRoomConstruction", idRoom);
		this.game[idRoom] = new Game(this, queue, "player", "bot", mode);
		this.game[idRoom].run();
		return idRoom;
	}

	endGame(room: string, loser: number): void {
		this.pinPongGateway.server.to(this.room[room][loser]).emit("youLose");
		this.pinPongGateway.server.to(this.room[room][1 - loser]).emit("youWin");

		//! set the state of the game {win or lose} {time} {score} {mode} {playerType}

		// delete the game
		this.game[room].stop();
		delete this.game[room];
		// delete the room
		delete this.room[room];
	}

	deletePlayer(player: string): void {
		// find the room of the player
		let room = Object.keys(this.room).find((key) => this.room[key].includes(player));
		if (room) {
			const loser = this.room[room].indexOf(player);

			this.pinPongGateway.server.to(this.room[room][loser]).emit("idRoomDestruction");

			this.endGame(room, loser);
			console.log("	Room deleted, id: " + room);
			return;
		}
		// find the player in the queue
		this.queue.deletePlayer(player);
		console.log("	Player deleted from the queue");
	}
}

