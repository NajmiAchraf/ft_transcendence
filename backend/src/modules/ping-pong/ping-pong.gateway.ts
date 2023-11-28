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
import { Mode, PlayerType } from './types/Common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';
import { SocketService } from 'src/common/services/socket.service';
import { PingPongService } from './ping-pong.service';

// namespace for websocket events (client -> server)
@WebSocketGateway(
	{
		// namespace: 'ping-pong',
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

	constructor(readonly pingPongService: PingPongService,
		private readonly prismaService: PrismaService,
		private readonly globalHelperService: GlobalHelperService,
		private readonly socketService: SocketService) {
		this.rooms = new Room(this);
	}

	async handleConnection(client: Socket) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('error', { error: 'Invalid Access Token' });
			client.disconnect();
			return;
		}

		// insert new connection
		this.socketService.insert(client.id, userId, 'ping-pong');

		console.log('NEW CONNECTION: ' + client.id + ' ' + userId);
	}

	async handleDisconnect(client: Socket) {
		const userId = this.socketService.getUserId(client.id, 'ping-pong');

		console.log('DELETE CONNECTION: ' + client.id + ' ' + userId);
		if (this.rooms.deletePlayerRoom(userId.toString())) { }
		else if (this.rooms.deletePlayerPair(client.id)) { }
		else console.log("Player not found in room or pair");

		// delete connection
		await this.quitGame(client);
		this.socketService.delete(client.id, 'ping-pong');
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

		// get user id from access token
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('error', { error: 'Invalid Access Token' });
			return;
		}

		// check if user is already in game
		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (user.in_game === true) {
			this.server.to(client.id).emit("denyToPlay", { error: "You are already in game" });
			return;
		}

		console.log('Received data:', data);
		try {

			if (playerType === "player") {
				const idRoom = this.rooms.addPlayer(userId.toString(), client.id);
				if (idRoom)
					console.log("	Room player created, id: " + idRoom);
			} else if (playerType === "bot") {
				const idRoom = this.rooms.addPlayerBot(userId.toString(), client.id, mode);
				if (idRoom)
					console.log("	Room bot created, id: " + idRoom);
			}
			// set player in game
			await this.prismaService.user.update({
				where: {
					id: user.id,
				},
				data: {
					in_game: true,
				}
			});
		} catch (error) {
			console.log(error);
		}
	}

	async quitGame(client: Socket): Promise<number | undefined> {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('error', { error: 'Invalid Access Token' });
			return undefined;
		}

		// set player not in game
		await this.prismaService.user.update({
			where: {
				id: userId,
			},
			data: {
				in_game: false,
			}
		});
		return userId;
	}

	@SubscribeMessage("leaveGame")
	async leaveGame(client: Socket) {
		console.log('leaveGame : ' + client.id);

		const userId = await this.quitGame(client)
		if (userId === undefined)
			return;

		this.rooms.deletePlayerRoom(userId.toString());
		this.server.to(client.id).emit("leaveRoom");
	}

	@SubscribeMessage("leavePair")
	async leavedPair(client: Socket) {
		console.log('leavePair : ' + client.id);

		const userId = await this.quitGame(client)
		if (userId === undefined)
			return;

		this.rooms.deletePlayerPair(userId.toString());
		this.server.to(client.id).emit("leaveQueue");
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
