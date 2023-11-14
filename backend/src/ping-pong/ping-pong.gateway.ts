import {
	MessageBody,
	OnGatewayInit,
	OnGatewayConnection,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import Room from "./Room";
import { Mode, PlayerType } from './Common';


// namespace for websocket events (client -> server)
@WebSocketGateway(
	// {
	// 	namespace: '/ping-pong',
	// 	transports: ['websocket'],
	// 	origins: 'http://localhost:3000',
	// 	// cors: {
	// 	// 	origin: '*',
	// 	// 	methods: ['GET', 'POST'],
	// 	// 	allowedHeaders: ['Content-Type'],
	// 	// 	credentials: true,
	// 	// },
	// }
)
export default class PingPongGateway implements OnGatewayInit, OnGatewayConnection {

	@WebSocketServer()
	server: Server;
	rooms: Room;

	constructor() {
		this.rooms = new Room(this);
	}

	handleConnection(client: Socket) {
		console.log('New connection : ' + client.id)
	}

	handleDisconnect(client: Socket) {
		console.log('Client disconnected: ' + client.id);
		this.rooms.deletePlayer(client.id);
	}

	afterInit(server: Server) {
		console.log("Server initialized");
	}

	onModuleInit() {
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
		console.log('leaveGame : ' + socket.id);
		this.rooms.deletePlayer(socket.id);
	}
}
