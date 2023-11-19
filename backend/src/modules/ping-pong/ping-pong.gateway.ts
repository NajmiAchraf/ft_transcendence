import {
	MessageBody,
	OnGatewayInit,
	OnGatewayConnection,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import Room from "./Room";
import { Mode, PlayerType } from './logic/Common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';


// namespace for websocket events (client -> server)
@WebSocketGateway(
	{
		namespace: 'ping-pong',
		transports: ['websocket'],
		cors: {
			origin: 'http://localhost:3000',
		},
	}
)
export default class PingPongGateway implements OnGatewayInit, OnGatewayConnection {

	@WebSocketServer()
	server: Server;
	rooms: Room;

	constructor(private readonly prismaService: PrismaService,
		private readonly globalHelperService: GlobalHelperService) {
		this.rooms = new Room(this);
	}

	async handleConnection(client: Socket) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('error', { error: 'Invalid Access Token' });
			client.disconnect();
			return;
		}

		// add player connection to db
		await this.prismaService.player_socket.create({
			data: {
				socket_id: client.id,
				player_id: userId,
			}
		});

		console.log('New connection : ' + client.id);
	}

	handleDisconnect(client: Socket) {
		console.log('Client disconnected: ' + client.id);
		if (this.rooms.deletePlayerRoom(client.id)) { }
		else if (this.rooms.deletePlayerQueue(client.id)) { }
		else console.log("Player not found in room or queue");

		// delete player from db

	}

	afterInit(server: Server) {
		console.log("Server initialized");
	}

	onModuleInit() {
		console.log("Module connected");
	}

	@SubscribeMessage("joinGame")
	async joinGame(@ConnectedSocket() client: Socket, @MessageBody() data: {
		playerType: PlayerType,
		mode: Mode
	}) {
		const playerType = data.playerType;
		const mode = data.mode;

		const entry = await this.prismaService.player_socket.findUnique({
			where: {
				socket_id: client.id,
			},
			include: {
				player_socket: true,
			}
		});

		if (entry.player_socket.in_game === true) {
			this.server.to(client.id).emit("denyToPlay", { error: "You are already in game" });
			return;
		}

		// set player in game
		await this.prismaService.user.update({
			where: {
				id: entry.player_socket.id,
			},
			data: {
				in_game: true,
			}
		});

		// imit to client that he is in queue
		this.server.to(client.id).emit("allowToPlay", { message: "You are in queue" });

		console.log('Received data:', data);
		try {
			if (playerType === "player") {
				const idRoom = this.rooms.addPlayer(client.id);
				if (idRoom)
					console.log("	Room player created, id: " + idRoom);
			} else if (playerType === "bot") {
				const idRoom = this.rooms.addPlayerAI(client.id, mode);
				console.log("	Room bot created, id: " + idRoom);
			}
		} catch (error) {
			console.log(error);
		}
	}

	@SubscribeMessage("leaveGame")
	leaveGame(socket: Socket) {
		console.log('leaveGame : ' + socket.id);
		this.rooms.deletePlayerRoom(socket.id);
	}

	@SubscribeMessage("leaveQueue")
	leaveQueue(socket: Socket) {
		console.log('leaveQueue : ' + socket.id);
		this.rooms.deletePlayerQueue(socket.id);
	}

	@SubscribeMessage("invitePlayer")
	invitePlayer(@MessageBody() data: {
		socketId: string,
		playerId: string,
	}) {
		// const socketId = data.socketId;
		// const playerId = data.playerId;

		console.log('Received data:', data);
		// try {
		// 	const idRoom = this.rooms.addPlayer(socketId);
		// 	if (idRoom)
		// 		console.log("	Room player created, id: " + idRoom);
		// } catch (error) {
		// 	console.log(error);
		// }
	}
}
