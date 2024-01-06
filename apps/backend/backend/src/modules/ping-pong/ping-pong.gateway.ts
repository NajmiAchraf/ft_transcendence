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
	}

	async handleDisconnect(client: Socket) {
		const userId = this.socketService.getUserId(client.id, 'ping-pong');

		if (userId === undefined) {
			this.server.to(client.id).emit('invalidAccess', { error: 'Invalid Access Token' });
			return;
		}

		// get room from database where player accepted invitation
		const invite = await this.prismaService.game_invitation.findFirst({
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

		if (invite) {
			const other_user_id = invite.sender_id === userId ? invite.receiver_id : invite.sender_id;

			const [other_client_id] = this.socketService.getSockets(other_user_id, 'ping-pong');

			const me_in_room = this.rooms.fetchRoom(userId.toString());
			const other_in_room = this.rooms.fetchRoom(other_user_id.toString());

			if (me_in_room !== undefined)
				this.rooms.resetRoom(me_in_room);
			else if (other_in_room !== undefined)
				this.rooms.resetRoom(other_in_room);
			else
				await this.prismaService.game_invitation.delete({
					where: {
						id: invite.id,
					},
				});

			this.server.to([client.id, other_client_id]).emit("invalidAccess", { error: "Player disconnected" });
			console.log("Player disconnected ", userId, " ", other_user_id);

		} else {

			console.log('DELETE CONNECTION: ' + client.id + ' ' + userId);
			if (this.rooms.deletePlayerRoom(userId.toString())) {
				this.server.to(client.id).emit("leaveRoom");
			}
			else if (this.rooms.deletePlayerPair(client.id)) {
				this.server.to(client.id).emit("leaveQueue");
			}
			else console.log("Player not found in room or pair");
		}

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

	@SubscribeMessage("checkInvitation")
	async checkInvite(@ConnectedSocket() client: Socket) {
		// get user id from access token
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('invalidAccess', { error: 'Invalid Access Token' });
			return;
		}

		// get room from database where player accepted invitation
		const invite = await this.prismaService.game_invitation.findFirst({
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

		if (!invite) {
			client.emit('invalidAccess', { error: 'There is no invitation for you!' });
			this.cleanUP(client);
			return;
		}

		const other_user_id = invite.sender_id === userId ? invite.receiver_id : invite.sender_id;

		const entry = await this.prismaService.user.findUnique({
			where: {
				id: other_user_id,
			},
			select: {
				status: true,
			}
		});

		if (entry.status === "offline") {
			client.emit('invalidAccess', { error: 'Other player disconnected or not routed!' });
			await this.prismaService.game_invitation.delete({
				where: {
					id: invite.id,
				},
			});
			this.cleanUP(client);
			return;
		}

		this.server.to(client.id).emit('allowToProceed');
	}

	@SubscribeMessage("invitePlayer")
	async invitePlayer(@ConnectedSocket() client: Socket) {
		// get user id from access token
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('invalidAccess', { error: 'Invalid Access Token' });
			return;
		}

		// get room from database where player accepted invitation
		const invite = await this.prismaService.game_invitation.findFirst({
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

		if (!invite) {
			client.emit('invalidAccess', { error: 'Other player left the game!' });
			this.cleanUP(client);
			return;
		}

		try {
			let user = "-1";
			let other = "-1";

			const sender_id: number = invite.sender_id;
			const receiver_id: number = invite.receiver_id;

			if (sender_id === userId) {
				other = receiver_id.toString();
				user = sender_id.toString();
			}
			else if (receiver_id === userId) {
				other = sender_id.toString();
				user = receiver_id.toString();
			}

			let idRoom = this.rooms.fetchRoom(other);

			if (idRoom !== undefined) {
				const room = this.rooms.room[idRoom];
				this.rooms.room[idRoom] = [room[0], [user, client.id]];
				this.rooms.addPlayerInviteStart(idRoom, this.rooms.room[idRoom]);
				await this.prismaService.game_invitation.delete({
					where: {
						id: invite.id,
					},
				});
			} else {
				idRoom = this.rooms.addPlayerInviteCreate(user, client.id);
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

		if (this.rooms.deletePlayerPair(userId.toString())) {
			this.server.to(client.id).emit("leaveQueue");
		}
	}
}
