import Game from "./Game";
import { Mode, PlayerType } from './Common';
import PingPongGateway from "./ping-pong.gateway";

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

	deletePlayer(player: string): boolean {
		if (this.queue.includes(player)) {
			this.queue = this.queue.filter((p) => p !== player);
			console.log("Player deleted from the queue");
			return true;
		}
		return false;
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

	private fetchRoom(playerID: string) {
		return (Object.keys(this.room).find((key) => this.room[key].includes(playerID)))
	}

	private checkRoom(playerID: string): boolean {
		if (this.fetchRoom(playerID)) {
			console.log("Player already in a room");
			return true;
		}
		return false;
	}

	private createGame(queue: [string, string | null], player1Type: PlayerType, player2Type: PlayerType, mode: Mode): void {
		const idRoom = (++this.idRoom).toString();
		this.room[idRoom] = queue;

		const [player1ID, player2ID] = queue;

		this.game[idRoom] = new Game(this, queue, player1Type, player2Type, mode);

		setTimeout(() => {
			this.pinPongGateway.server.to(player1ID).emit("dataPlayer", {
				side: "right",
				id: player1ID,
			});

			this.pinPongGateway.server.to(player2ID).emit("dataPlayer", {
				side: "left",
				id: player2ID,
			});

			this.pinPongGateway.server.to(queue).emit("idRoomConstruction", idRoom);

			// this.game[idRoom].run() 
			setTimeout(() => {
				this.game[idRoom].run()
			}, 2000);
		}, 1000);

	}

	//TODO: Add invitation system across the socket beside the queue
	addPlayer(playerID: string): string | undefined {
		if (this.checkRoom(playerID) === true) {
			console.log("Player already in a room");
			return undefined;
		}

		const queue = this.queue.addPlayer(playerID);

		if (queue) {
			this.createGame(queue, "player", "player", "medium");
			return this.idRoom.toString();
		}

		return undefined;
	}

	addPlayerAI(playerID: string, mode: Mode): string | undefined {
		if (this.checkRoom(playerID) === true) {
			console.log("Player already in a room");
			return undefined;
		}

		const queue: [string, string | null] = [playerID, null];

		this.createGame(queue, "player", "bot", mode);

		return this.idRoom.toString();
	}

	endGame(room: string, loser: number, corruption: boolean): void {
		if (corruption === false) {
			this.pinPongGateway.server.to(this.room[room][loser]).emit("youLose", this.room[room][loser]);
			console.log("Player " + this.room[room][loser] + " lose");
		}

		this.pinPongGateway.server.to(this.room[room][1 - loser]).emit("youWin", this.room[room][1 - loser]);
		console.log("Player " + this.room[room][1 - loser] + " win");
		//! Set the state of the game {win or lose} {time} {score} {mode} {playerType}

		// Delete the game
		this.game[room].stop();
		delete this.game[room];

		// Delete the room
		delete this.room[room];
	}

	deletePlayerRoom(playerID: string): boolean {
		const room = this.fetchRoom(playerID);
		if (room) {
			const loser = this.room[room].indexOf(playerID);
			const roomID = this.room[room][loser];

			this.pinPongGateway.server.to(roomID[1 - loser]).emit("idRoomDestruction");

			this.endGame(room, loser, true);

			console.log("Room deleted, id: " + room);
			return true;
		}
		return false;
	}

	deletePlayerQueue(playerID: string): boolean {
		return (this.queue.deletePlayer(playerID));
	}
}
