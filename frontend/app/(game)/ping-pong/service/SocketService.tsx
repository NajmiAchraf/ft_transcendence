'use client';

import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket } from "socket.io-client";

import Game from "../game/Game";
import { Props } from "../common/Common";

export default class SocketService {
	private game: Game;
	private socket: Socket<DefaultEventsMap, DefaultEventsMap>;
	private props: Props;
	private dataPlayer: any | undefined = undefined;

	constructor(webSocket: Socket<DefaultEventsMap, DefaultEventsMap>, props: Props) {
		this.socket = webSocket;
		this.props = props;
		this.initialization();
		console.log("readyToPlay");
	}

	stopGame = () => {
		this.game.stop();
	}

	getSocket() {
		return this.socket;
	}

	getDataPlayer() {
		return this.dataPlayer;
	}

	initialization() {
		this.socket.on("connect", () => {
			console.log("Connected to namespace: /ping-pong");
		});

		this.socket.on("idRoomConstruction", (idRoomConstruction: string) => {
			console.log("idRoomConstruction: ", idRoomConstruction);

			this.game = new Game(this, this.props);
			this.game.room = idRoomConstruction;
			console.log("this.game.room: ", this.game.room);
			this.game.run();
		});

		this.socket.on("idRoomDestruction", (idRoomDestruction: string) => {
			console.log("idRoomDestruction: ", idRoomDestruction);
			this.game.stop();
		});

		this.socket.on("youWin", (data: any) => {
			console.log("youWin: ", data);
			this.game.win();

		});

		this.socket.on("youLose", (data: any) => {
			console.log("youLose: ", data);
			this.game.lose();
		});

		this.socket.on("dataPlayer", (data: any) => {
			console.log("dataPlayer: ", data);
			this.dataPlayer = data;
		});
	}

	leaveGame() {
		console.log("leaveGame");
		this.socket.emit("leaveGame");
	}
}