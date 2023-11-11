import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import Room from "./Room";
import { Mode, PlayerType } from './Common';


// namespace for websocket events (client -> server)
@WebSocketGateway(
	// {
	// 	namespace: '/ping-pong',
	// 	transports: ['websocket'],
	// 	origins: '*:*',
	// 	// cors: {
	// 	// 	origin: '*',
	// 	// 	methods: ['GET', 'POST'],
	// 	// 	allowedHeaders: ['Content-Type'],
	// 	// 	credentials: true,
	// 	// },
	// }
)
export class PingPongGateway {

	@WebSocketServer()
	server: Server;
	rooms: Room;

	constructor() {
		this.rooms = new Room(this);
	}

	onConnection = (socket: Socket) => {
		console.log('New connection : ' + socket.id);
	}

	onModuleInit() {
		// on connection
		this.server.on('connection', this.onConnection);

		console.log("Module connected");
	}

	@SubscribeMessage("joinGame")
	joinGame(@MessageBody() data: {
		socketId: string,
		playerType: PlayerType,
		mode: Mode
	}) {
		const socketId = data.socketId;
		const playerType = data.playerType;
		const mode = data.mode;

		console.log('Received data:', data);
		try {
			if (playerType === "player") {
				const idRoom = this.rooms.addPlayer(socketId);
				if (idRoom)
					console.log("	Room player created, id: " + idRoom);
			} else if (playerType === "bot") {
				const idRoom = this.rooms.addPlayerAI(socketId, mode);
				console.log("	Room bot created, id: " + idRoom);
			}
		} catch (error) {
			console.log(error);
		}
	}

	@SubscribeMessage("leaveGame")
	leaveGame(socket: Socket) {
		console.log('Disconnection : ' + socket.id);
		this.rooms.deletePlayer(socket.id);
	}
}
