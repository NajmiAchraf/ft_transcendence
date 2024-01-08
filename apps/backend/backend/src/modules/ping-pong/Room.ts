import { GameResultType, Mode, PlayerType, Side } from 'src/modules/ping-pong/common/Common';
import Game from "src/modules/ping-pong/component/Game";
import PingPongGateway from "src/modules/ping-pong/ping-pong.gateway";

// PairType = [[playerID, clientID], [playerID, clientID]]
type PairType = [[string, string], [string, string]];

class Pair {
	private pair: PairType = [['', ''], ['', '']];
	private count: number = 0;

	private fetchPair(playerID: string): string | undefined {
		// find the room where the player is in just the PlayerID without the clientID
		for (const key in this.pair) {
			// console.log("key " + key);
			for (const player of this.pair[key]) {
				// console.log("player :" + player + ' ===? ' + playerID);
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
			this.clearPair();
			return true;
		}
		console.log("Player not found in the pair");
		return false;
	}

	clearPair(): void {
		this.pair = [['', ''], ['', '']];
		this.count = 0;
		console.log("Player deleted from the pair and pair cleared");
	}
}

export default class Room {
	room: { [key: string]: PairType } = {};
	game: { [key: string]: Game } = {};
	idRoom: number = 1;
	pair: Pair = new Pair();
	pingPongGateway: PingPongGateway;

	constructor(
		pingPongGateway: PingPongGateway,
	) {
		this.pingPongGateway = pingPongGateway;
		// console.log("this.pingPongGateway.server " + this.pingPongGateway.server);
	}

	getRoom(room: string): PairType {
		return this.room[room];
	}

	fetchRoom(playerID: string): string | undefined {
		if (this.room === undefined)
			return undefined;
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

	checkRoom(playerID: string): boolean {
		if (this.fetchRoom(playerID) !== undefined) {
			console.log("Player already in a room");
			return true;
		}
		return false;
	}

	private createRoom(pair: PairType): string {
		const idRoom = (++this.idRoom).toString();
		this.room[idRoom] = pair;
		return idRoom;
	}

	private createGame(idRoom: string, pair: PairType, player1Type: PlayerType, player2Type: PlayerType, mode: Mode): void {
		const [player1, player2] = pair;

		this.pingPongGateway.server.to(player1[1]).emit("dataPlayer", {
			side: "right",
			player1Name: player1[0],
			player2Name: player2[0],
			room: idRoom,
		});

		this.pingPongGateway.server.to(player2[1]).emit("dataPlayer", {
			side: "left",
			player1Name: player1[0],
			player2Name: player2[0],
			room: idRoom,
		});

		this.game[idRoom] = new Game(this, [player1[1], player2[1]], player1Type, player2Type, mode, idRoom);
	}

	async addPlayer(playerID: string, clientID: string): Promise<string | undefined> {
		const pair = this.pair.addPlayer(playerID, clientID);
		// emit to client that he is in pair
		this.pingPongGateway.server.to(clientID).emit("allowToWait", { message: "You are in pair" });

		if (pair) {
			if (await this.pingPongGateway.globalHelperService.isBlocked(parseInt(pair[0][0]), parseInt(pair[1][0])) ||
				await this.pingPongGateway.globalHelperService.isBlocked(parseInt(pair[1][0]), parseInt(pair[0][0]))) {
				this.pair.clearPair();
				this.pingPongGateway.server.to([pair[0][1], pair[1][1]]).emit("invalidAccess", { error: "Something went wrong" });
				return undefined;
			}

			const idRoom = this.createRoom(pair);
			this.createGame(idRoom, pair, "player", "player", "medium");

			this.pingPongGateway.server.to([pair[0][1], pair[1][1]]).emit("allowToPlay", { message: "You are in room" });

			return this.idRoom.toString();
		}

		return undefined;
	}

	addPlayerBot(playerID: string, clientID: string, mode: Mode, side: Side): string | undefined {
		if (side === "right") {

			const pair: PairType = [[playerID, clientID], ['bot', 'bot']];
			const idRoom = this.createRoom(pair);
			this.createGame(idRoom, pair, "player", "bot", mode);

		} else if (side === "left") {

			const pair: PairType = [['bot', 'bot'], [playerID, clientID]];
			const idRoom = this.createRoom(pair);
			this.createGame(idRoom, pair, "bot", "player", mode);

		}

		// emit to client that he is in pair
		this.pingPongGateway.server.to(clientID).emit("allowToPlay", { message: "You are in room" });

		return this.idRoom.toString();
	}

	addPlayerInviteCreate(playerID: string, clientID: string): string | undefined {

		const pair: PairType = [[playerID, clientID], ['', '']];
		this.createRoom(pair);

		this.pingPongGateway.server.to(clientID).emit("allowToWait", { message: "You are in pair" });

		return this.idRoom.toString();
	}

	addPlayerInviteStart(idRoom: string, pair: PairType): void {

		this.createGame(idRoom, pair, "player", "player", "medium");

		this.pingPongGateway.server.to([pair[0][1], pair[1][1]]).emit("allowToPlay", { message: "You are in room" });
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
			this.pingPongGateway.server.to(this.room[room][loser][1]).emit("youLose", this.room[room][loser][1]);
			console.log("Player " + this.room[room][loser][1] + " lose");
		}

		this.pingPongGateway.server.to(this.room[room][1 - loser][1]).emit("youWin", this.room[room][1 - loser][1]);
		console.log("Player " + this.room[room][1 - loser][1] + " win");

		const started = this.game[room].started;

		if (!started) {

			this.pingPongGateway.server.to([this.room[room][0][1], this.room[room][1][1]]).emit("invalidAccess", { error: "Something went wrong" });

		} else if (started) {

			this.game[room].stop();
			const start = new Date(this.game[room].start_game);
			const end = new Date(this.game[room].end_game);
			console.log("	start: " + start + "\n	end: " + end);

			const gameResult: GameResultType = {
				winnerId: winnerID,
				loserId: loserID,
				winnerScore: winnerGoals,
				loserScore: loserGoals,
				startTime: start,
				endTime: end,
			};
			this.pingPongGateway.pingPongService.postGameLogic(gameResult);
		}

		// Delete and free the New Game allocated in the memory
		if (this.game[room] instanceof Game) {
			this.game[room].destroy();
			delete this.game[room];
		}

		this.resetRoom(room);
	}

	resetRoom(room: string): void {
		// Delete the room
		delete this.room[room];
		this.room[room] = [['', ''], ['', '']];
	}

	deletePlayerRoom(playerID: string): boolean {
		const room = this.fetchRoom(playerID);

		console.log("this.room " + room);
		if (room !== undefined) {
			const loser = this.room[room].findIndex((player) => player[0] === playerID);
			const roomID = this.room[room].map((player) => player[1]);

			// console.log('all: ' + this.room + ' ' + this.room[room] + ' ' + roomID + ' ' + loser);
			console.log("this.room: " + this.room[room])
			console.log("this.room[room]: " + this.room[room][loser])
			console.log("loser: " + loser + " roomID: " + roomID);

			this.pingPongGateway.server.to(roomID[loser]).emit("roomDestruction", { message: "Room deleted", room: room });

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
