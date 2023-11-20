import Game from "./logic/Game";
import { Mode, PlayerType } from './logic/Common';
import PingPongGateway from "./ping-pong.gateway";
import { PrismaService } from "../prisma/prisma.service";

type QueueType = [[string, string], [string, string]];
type RoomType = [[string, string], [string | null, string | null]];

class Queue {
	private queue: QueueType = [[null, null], [null, null]];

	addPlayer(playerID: string, client: string): QueueType | undefined {
		if (Object.keys(this.queue).includes(playerID)) {
			console.log("Player already in the queue");
			return undefined;
		}

		this.queue.push([playerID, client]);

		if (this.queue.length === 2) {
			const [player1, player2] = this.queue;
			// clear the queue QueueType;
			this.queue = [[null, null], [null, null]];
			return [player1, player2];
		}

		return undefined;
	}

	deletePlayer(playerID: string): boolean {
		// if (Object.keys(this.queue).includes(playerID)) {
		// 	this.queue = this.queue.filter((player) => player[0] !== playerID);
		// 	console.log("Player deleted from the queue");
		// 	return true;
		// }
		return false;
	}
}

export default class Room {
	room: { [key: string]: RoomType } = {};
	game: { [key: string]: Game } = {};
	idRoom: number = -1;
	queue: Queue = new Queue();
	// pinPongGateway: PingPongGateway;

	constructor(
		private readonly prismaService: PrismaService,
		private readonly pinPongGateway: PingPongGateway
	) {
		// this.pinPongGateway = pinPongGateway;
		console.log("this.pinPongGateway.server " + this.pinPongGateway.server);
	}

	getRoom(room: string): RoomType {
		return this.room[room];
	}

	private fetchRoom(playerID: string, clientID: string): string | undefined {
		return Object.keys(this.room).find((room) => this.room[room].includes([playerID, clientID]));
	}

	private checkRoom(playerID: string, clientID: string): boolean {
		if (this.fetchRoom(playerID, clientID) !== undefined) {
			console.log("Player already in a room");
			return true;
		}
		return false;
	}

	private createGame(queue: RoomType, player1Type: PlayerType, player2Type: PlayerType, mode: Mode): void {
		const idRoom = (++this.idRoom).toString();
		this.room[idRoom] = queue;

		const [player1, player2] = queue;

		this.game[idRoom] = new Game(this, [player1[1], player2[1]], player1Type, player2Type, mode);

		setTimeout(() => {
			this.pinPongGateway.server.to(player1[1]).emit("dataPlayer", {
				side: "right",

			});

			this.pinPongGateway.server.to(player2[1]).emit("dataPlayer", {
				side: "left",
			});

			this.pinPongGateway.server.to([player1[1], player2[1]]).emit("idRoomConstruction", idRoom);

			// this.game[idRoom].run() 
			setTimeout(() => {
				this.game[idRoom].run()
			}, 2000);
		}, 1000);

	}

	//TODO: Add invitation system across the socket beside the queue
	addPlayer(playerID: string, clientID: string): string | undefined {
		if (this.checkRoom(playerID, clientID) === true) {
			this.pinPongGateway.server.to(clientID).emit("denyToPlay", { error: "You are already in a room" });
			return undefined;
		}

		const queue = this.queue.addPlayer(playerID, clientID);

		if (queue) {
			this.createGame(queue, "player", "player", "medium");
			return this.idRoom.toString();
		}

		return undefined;
	}

	addPlayerBot(playerID: string, clientID: string, mode: Mode): string | undefined {
		if (this.checkRoom(playerID, clientID) === true) {
			this.pinPongGateway.server.to(playerID).emit("denyToPlay", { error: "You are already in a room" });
			return undefined;
		}

		const queue: RoomType = [[playerID, clientID], [null, null]];

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
		// const room = this.fetchRoom(playerID);
		// if (room) {
		// 	const loser = this.room[room].indexOf(playerID);
		// 	const roomID = this.room[room][loser];

		// 	this.pinPongGateway.server.to(roomID[1 - loser]).emit("idRoomDestruction");

		// 	this.endGame(room, loser, true);

		// 	console.log("Room deleted, id: " + room);
		// 	return true;
		// }
		return false;
	}

	deletePlayerQueue(playerID: string): boolean {
		return (this.queue.deletePlayer(playerID));
	}
}
