import {
	MessageBody,
	OnGatewayInit,
	OnGatewayConnection,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	ConnectedSocket,
} from '@nestjs/websockets';

import { Namespace, Server, Socket } from 'socket.io';

import Room from "src/modules/ping-pong/Room";
import { PingPongService } from 'src/modules/ping-pong/ping-pong.service';
import { Mode, PlayerType, Side } from 'src/modules/ping-pong/common/Common';

import { PrismaService } from 'src/modules/prisma/prisma.service';

import { GlobalHelperService } from 'src/common/services/global_helper.service';
import { SocketService } from 'src/common/services/socket.service';

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
	server: Namespace;
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
			this.server.to(client.id).emit('invalidAccess', { error: 'Invalid Access Token' });
			//! route to authentication page
			client.disconnect();
			return;
		}
		// check if the user is already in game
		const entry = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (entry.in_game === true) {
			this.server.to(client.id).emit("denyToPlay", { error: "You are already in game" });

			client.disconnect();
			return;
		}

		// insert new connection
		this.socketService.insert(client.id, userId, 'ping-pong');


		// set player in game
		await this.prismaService.user.update({
			where: {
				id: userId,
			},
			data: {
				in_game: true,
			}
		});
		console.log('NEW CONNECTION: ' + client.id + ' ' + userId);
	}

	async handleDisconnect(client: Socket) {
		const userId = this.socketService.getUserId(client.id, 'ping-pong');

		if (userId === undefined) {
			this.server.to(client.id).emit('invalidAccess', { error: 'Invalid Access Token' });
			//! route to authentication page
			return;
		}

		console.log('DELETE CONNECTION: ' + client.id + ' ' + userId);
		if (this.rooms.deletePlayerRoom(userId.toString())) {
			this.server.to(client.id).emit("leaveRoom");
		}
		else if (this.rooms.deletePlayerPair(client.id)) {
			this.server.to(client.id).emit("leaveQueue");
		}
		else console.log("Player not found in room or pair");

		await this.cleanUP(client);
		// delete connection
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
		mode: Mode,
		side: Side,
	}) {
		const playerType = data.playerType;
		const mode = data.mode;
		const side = data.side;

		// get user id from access token
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('invalidAccess', { error: 'Invalid Access Token' });
			//! route to authentication page
			return;
		}

		console.log('Received data:', data);
		try {

			if (playerType === "player") {
				const idRoom = this.rooms.addPlayer(userId.toString(), client.id);
				if (idRoom)
					console.log("	Room player created, id: " + idRoom);
			} else if (playerType === "bot") {
				const idRoom = this.rooms.addPlayerBot(userId.toString(), client.id, mode, side);
				if (idRoom)
					console.log("	Room bot created, id: " + idRoom);
			}

		} catch (error) {
			console.error(error);
		}
	}

	@SubscribeMessage("invitePlayer")
	async invitePlayer(@ConnectedSocket() client: Socket) {
		// get user id from access token
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('invalidAccess', { error: 'Invalid Access Token' });
			//! route to authentication page
			return;
		}

		// get room from database were player accepted invitation
		const entry = await this.prismaService.game_invitation.findFirst({
			where: {
				OR: [
					{
						sender_id: userId,
					},
					{
						receiver_id: userId,
					},
				],
			}
		});

		if (!entry) {
			client.emit('invalidAccess', { error: 'You were not invited!' });
			this.cleanUP(client);
			return;
		}

		const sender_id = entry.sender_id;
		const receiver_id = entry.receiver_id;

		try {
			const sender = this.rooms.checkRoom(sender_id.toString());
			const receiver = this.rooms.checkRoom(receiver_id.toString());

			let user = "-1";
			let idRoom = "-1";

			if (sender === true) {
				user = sender_id.toString();
				idRoom = this.rooms.fetchRoom(receiver_id.toString());
			} else if (receiver === true) {
				user = receiver_id.toString();
				idRoom = this.rooms.fetchRoom(sender_id.toString());
			}

			if (user !== "-1") {
				const room = this.rooms.room[idRoom];
				this.rooms.room[idRoom] = [room[0], [userId.toString(), client.id]];
				this.rooms.addPlayerInviteStart(idRoom, this.rooms.room[idRoom]);
			} else {
				const idRoom = this.rooms.addPlayerInviteCreate(userId.toString(), client.id);
				if (idRoom)
					console.log("	Room invite joined, id: " + idRoom);
			}
		} catch (error) {
			console.error(error);
		}
	}

	async quitGame(client: Socket): Promise<number | undefined> {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('invalidAccess', { error: 'Invalid Access Token' });
			//! route to authentication page
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
		//! invitation delete

		return userId;
	}

	async cleanUP(client: Socket) {
		await this.quitGame(client);
		client.disconnect();
	}

	@SubscribeMessage("leaveGame")
	async leaveGame(client: Socket) {
		console.log('leaveGame : ' + client.id);

		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined)
			return;

		if (!this.rooms.deletePlayerRoom(userId.toString())) {
			this.server.to(client.id).emit("leaveRoom");
		}
	}

	@SubscribeMessage("leavePair")
	async leavedPair(client: Socket) {
		console.log('leavePair : ' + client.id);

		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined)
			return;

		if (this.rooms.deletePlayerPair(userId.toString())) {//! check if it's ok
			this.server.to(client.id).emit("leaveQueue");
		}
	}
}
