import Game from "./logic/Game";
import { GameResultType, Mode, PlayerType } from './types/Common';
import PingPongGateway from "./ping-pong.gateway";
import { PrismaService } from "../prisma/prisma.service";
import e from "express";
import { PingPongService } from "./ping-pong.service";

// PairType = [[playerID, clientID], [playerID, clientID]]
type PairType = [[string, string], [string, string]];

class Pair {
	private pair: PairType = [['', ''], ['', '']];
	private count: number = 0;

	private fetchPair(playerID: string): string | undefined {
		// find the room where the player is in just the PlayerID without the clientID
		for (const key in this.pair) {
			console.log("key " + key);
			for (const player of this.pair[key]) {
				console.log("player :" + player + ' ===? ' + playerID);
				if (player === playerID)
					return key;
			}
		}
		return undefined;
	}

	addPlayer(playerID: string, client: string): PairType | undefined {
		if (this.fetchPair(playerID) !== undefined) {
			console.log("Player already in the pair");
			return undefined;
		}

		this.pair[this.count] = [playerID, client];
		this.count++;

		if (this.count === 2) {
			const [player1, player2] = this.pair;
			// clear the pair PairType;
			this.pair = [['', ''], ['', '']];
			this.count = 0;
			return [player1, player2];
		}

		return undefined;
	}

	deletePlayer(playerID: string): boolean {
		if (this.fetchPair(playerID) !== undefined) {
			this.pair = [['', ''], ['', '']];
			this.count = 0;

			console.log("Player deleted from the pair and pair cleared");
			return true;
		}
		console.log("Player not found in the pair");
		return false;
	}
}

export default class Room {
	room: { [key: string]: PairType } = {};
	game: { [key: string]: Game } = {};
	idRoom: number = -1;
	pair: Pair = new Pair();
	pingPongGateway: PingPongGateway;

	constructor(
		pingPongGateway: PingPongGateway,
	) {
		this.pingPongGateway = pingPongGateway;
		console.log("this.pingPongGateway.server " + this.pingPongGateway.server);
	}

	getRoom(room: string): PairType {
		return this.room[room];
	}

	private fetchRoom(playerID: string): string | undefined {
		// find the room where the player is in just the PlayerID without the clientID
		for (const key in this.room) {
			// console.log("key " + key);
			for (const player of this.room[key]) {
				// console.log("player :" + player[0] + ' ===? ' + playerID);
				if (player[0] === playerID)
					return key;
			}
		}
		return undefined;
	}

	socketRoom(clientID: string): string | undefined {
		// find the room where the player is in just the PlayerID without the clientID
		for (const key in this.room) {
			// console.log("key " + key);
			for (const player of this.room[key]) {
				// console.log("player :" + player[0] + ' ===? ' + playerID);
				if (player[1] === clientID)
					return key;
			}
		}
		return undefined;
	}

	private checkRoom(playerID: string): boolean {
		if (this.fetchRoom(playerID) !== undefined) {
			console.log("Player already in a room");
			return true;
		}
		return false;
	}

	private createGame(pair: PairType, player1Type: PlayerType, player2Type: PlayerType, mode: Mode): void {
		const idRoom = (++this.idRoom).toString();
		this.room[idRoom] = pair;

		const [player1, player2] = pair;

		this.game[idRoom] = new Game(this, [player1[1], player2[1]], player1Type, player2Type, mode);

		setTimeout(() => {
			this.pingPongGateway.server.to(player1[1]).emit("dataPlayer", {
				side: "right",
			});

			this.pingPongGateway.server.to(player2[1]).emit("dataPlayer", {
				side: "left",
			});

			this.pingPongGateway.server.to([player1[1], player2[1]]).emit("idRoomConstruction", idRoom);

			// this.game[idRoom].run() 
			setTimeout(() => {
				this.game[idRoom].run()
			}, 2000);
		}, 1000);
	}

	//TODO: Add invitation system across the socket beside the pair
	addPlayer(playerID: string, clientID: string): string | undefined {
		if (this.checkRoom(playerID) === true) {
			this.pingPongGateway.server.to(clientID).emit("denyToPlay", { error: "You are already in a room" });
			return undefined;
		}

		const pair = this.pair.addPlayer(playerID, clientID);
		// emit to client that he is in pair
		this.pingPongGateway.server.to(clientID).emit("allowToPlay", { message: "You are in pair" });

		if (pair) {
			this.createGame(pair, "player", "player", "medium");
			return this.idRoom.toString();
		}

		return undefined;
	}

	addPlayerBot(playerID: string, clientID: string, mode: Mode): string | undefined {
		if (this.checkRoom(playerID) === true) {
			this.pingPongGateway.server.to(playerID).emit("denyToPlay", { error: "You are already in a room" });
			return undefined;
		}

		const pair: PairType = [[playerID, clientID], ['bot', 'bot']];
		// emit to client that he is in pair
		this.pingPongGateway.server.to(clientID).emit("allowToPlay", { message: "You are in pair" });

		this.createGame(pair, "player", "bot", mode);

		return this.idRoom.toString();
	}

	endGame(room: string, loser: number, corruption: boolean): void {
		let loserID = parseInt(this.room[room][loser][0]);
		let winnerID = parseInt(this.room[room][1 - loser][0]);
		if (Number.isNaN(loserID))
			loserID = undefined;
		if (Number.isNaN(winnerID))
			winnerID = undefined;

		let loserGoals;
		let winnerGoals;
		if (loser == 0) {
			loserGoals = this.game[room].player2.score;
			winnerGoals = this.game[room].player1.score;
		} else {
			loserGoals = this.game[room].player1.score;
			winnerGoals = this.game[room].player2.score;
		}

		console.log("loser: " + loserID + " winner: " + winnerID + " loserGoals: " + loserGoals + " winnerGoals: " + winnerGoals);

		if (corruption === false) {
			this.pingPongGateway.server.to(this.room[room][loser]).emit("youLose", this.room[room][loser]);
			console.log("Player " + this.room[room][loser] + " lose");
		}

		this.pingPongGateway.server.to(this.room[room][1 - loser]).emit("youWin", this.room[room][1 - loser]);
		console.log("Player " + this.room[room][1 - loser] + " win");
		this.game[room].stop();
		const start = new Date(this.game[room].start_game);
		// const duration = new Date(this.game[room].duration_game);
		const end = new Date(this.game[room].end_game);

		console.log("start: " + start + " end: " + end);


		//! Set the state of the game {win or lose} {time} {score} {mode} {playerType}

		const gameResult: GameResultType = {
			winnerId: winnerID,
			loserId: loserID,
			winnerScore: winnerGoals,
			loserScore: loserGoals,
			startTime: start,
			endTime: end,
		};
		this.pingPongGateway.pingPongService.postGameLogic(gameResult);




		// Delete the game
		delete this.game[room];
		// Delete the room
		delete this.room[room];
	}

	deletePlayerRoom(playerID: string): boolean {
		const room = this.fetchRoom(playerID);

		console.log("this.room " + room);
		if (room) {
			const loser = this.room[room].findIndex((player) => player[0] === playerID);
			const roomID = this.room[room].map((player) => player[1]);

			console.log('all: ' + this.room + ' ' + this.room[room] + ' ' + roomID + ' ' + loser);
			this.pingPongGateway.server.to(roomID[1 - loser]).emit("idRoomDestruction");

			this.endGame(room, loser, true);

			console.log("Room deleted, id: " + room);
			return true;
		}
		return false;
	}

	deletePlayerPair(playerID: string): boolean {
		return (this.pair.deletePlayer(playerID));
	}
}
