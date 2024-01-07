import { ForbiddenException, Injectable } from "@nestjs/common";
import { Namespace, Socket } from "socket.io";
import { SocketService } from "src/common/services/socket.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChannelChatService {
	constructor(private readonly socketService: SocketService,
		private readonly prismaService: PrismaService) { }

	async joinChannel(server: Namespace, client: Socket, message: any) {
		try {
			console.log('here\n');
			const res = await fetch(`${process.env.API_URL}/chatHttp/joinChannel`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + client.handshake.query['accessToken'],
				},
				body: JSON.stringify(message)
			});
			if (!res.ok) {
				const data = await res.json();
				// console.log(data);
				console.log('something went wrong');
				server.to(client.id).emit('Invalid access', { error: "error occured" });
				return;
			}

			const userId = this.socketService.getUserId(client.id);
			const socketIds = this.socketService.getSockets(userId, 'chat');

			socketIds.forEach(socketId => {
				server.sockets.get(socketId).join(message.channelId.toString());
			});

			const user = await this.prismaService.user.findUnique({ where: { id: userId, } });
			const roomSocketsIds = Array.from(server.adapter.rooms.get(message.channelId.toString()).values());
			const roomSockets = roomSocketsIds.map(socketId => server.sockets.get(socketId));
			const filteredSockets = await this.socketService.filterSockets(userId, roomSockets);

			filteredSockets.forEach(socket => {
				socket.emit('joined', { id: user.id, nickname: user.nickname });
			});
		} catch (err) {
			console.log('something went wrong-');
			console.log(err);
			server.to(client.id).emit('Invalid access', { error: err });
		}
	}

	async addChannelMember(server: Namespace, client: Socket, message: any) {
		try {
			const res = await fetch(`${process.env.API_URL}/chatHttp/addChannelMember`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + client.handshake.query['accessToken'],
				},
				body: JSON.stringify(message)
			});
			if (!res.ok) {
				console.log('something went wrong');
				server.to(client.id).emit('Invalid access', { error: "error occured" });
				return;
			}

			// !send a notification
			const socketIds = this.socketService.getSockets(+message.profileId, 'chat');
			socketIds.forEach(socketId => {
				server.sockets.get(socketId).join(message.channelId.toString());
			});

			const roomSocketsIds = Array.from(server.adapter.rooms.get(message.channelId.toString()).values());
			const roomSockets = roomSocketsIds.map(socketId => server.sockets.get(socketId));
			const filteredSockets = await this.socketService.filterSockets(+message.profileId, roomSockets);

			const user = await this.prismaService.user.findUnique({ where: { id: +message.profileId, } });
			filteredSockets.forEach(socket => {
				socket.emit('addChannelMember', { id: user.id, channel_id: message.channelId, nickname: user.nickname });
			});

			await this.prismaService.notification.create({
				data: {
					notification_text: 'You have been added to a channel',
					user_id: +message.profileId,
				}
			});

		} catch (err) {
			console.log(err);
			server.to(client.id).emit('Invalid access', { error: err });
		}
	}

	async addChannelAdmin(server: Namespace, client: Socket, message: any) {
		try {
			const res = await fetch(`${process.env.API_URL}/chatHttp/addChannelAdmin`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + client.handshake.query['accessToken'],
				},
				body: JSON.stringify(message)
			});
			if (!res.ok) {
				console.log('something went wrong');
				server.to(client.id).emit('Invalid access', { error: "error occured" });
				return;
			}

			// get client id from profile id
			const newMemberSocketIds = this.socketService.getSockets(+message.profileId, 'chat');
			// emit to all sockets of the user
			newMemberSocketIds.forEach(socketId => {
				server.to(socketId).emit('addChannelAdmin', { message: 'you are now admin', channelId: message.channelId });
			});

			// !send a notification
			await this.prismaService.notification.create({
				data: {
					notification_text: 'You have become admin of a channel',
					user_id: +message.profileId,
				}
			});
		} catch (err) {
			console.log('something went wrong-');
			console.log(err);
			server.to(client.id).emit('Invalid access', { error: err });
		}
	}

	async channelCreateChat(server: Namespace, client: Socket, message: any) {
		try {
			const res = await fetch(`${process.env.API_URL}/chatHttp/createChannelMessage`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + client.handshake.query['accessToken'],
				},
				body: JSON.stringify(message)
			});
			if (!res.ok) {
				console.log('something went wrong');
				server.to(client.id).emit('Invalid access', { error: "error occured" });
				return;
			}
			const userId = this.socketService.getUserId(client.id);
			const connectedSocketIds = Array.from(server.adapter.rooms.get(message.channelId.toString()).values());
			const connectedSockets = connectedSocketIds.map(socketId => server.sockets.get(socketId));
			let filteredSockets = await this.socketService.filterSockets(userId, connectedSockets);

			const entry = await this.prismaService.channels_message.findMany({
				where: {
					sender_id: userId
				},
				orderBy: {
					created_at: 'desc',
				},
				take: 1,
				include: {
					cm_sender: true,
				}
			});

			const messagePayload = {
				channel_id: entry[0].channel_id,
				sender_id: entry[0].sender_id,
				nickname: entry[0].cm_sender.nickname,
				message_text: entry[0].message_text,
				avatar: entry[0].cm_sender.avatar,
				status: entry[0].cm_sender.status,
				created_at: entry[0].created_at,
			}
			filteredSockets.forEach(socket => {
				socket.emit('receiveChannelMessage', messagePayload);
			});
		} catch (err) {
			console.log('something went wrong-');
			if (err instanceof ForbiddenException) {
				if (err.message === 'You are muted') {
					const userId = this.socketService.getUserId(client.id);
					const connectedSockets = this.socketService.getSockets(userId, 'chat');
					connectedSockets.forEach(socket => {
						socket.emit('muted', { userId: userId, channelId: message.channelId });
					});
					return;
				}
				server.to(client.id).emit('Invalid access', { error: "error occured" });
			}
		}
	}

	async leaveChannel(server: Namespace, client: Socket, message: any) {

		try {
			const res = await fetch(`${process.env.API_URL}/chatHttp/leaveChannel`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + client.handshake.query['accessToken'],
				},
				body: JSON.stringify(message)
			});
			if (!res.ok) {
				console.log('something went wrong');
				server.to(client.id).emit('Invalid access', { error: "error occured" });
				return;
			}

			const userId = this.socketService.getUserId(client.id);

			const connectedSocketIds = Array.from(server.adapter.rooms.get(message.channelId.toString()).values());
			const connectedSockets = connectedSocketIds.map(socketId => server.sockets.get(socketId));
			const filteredSockets = await this.socketService.filterSockets(userId, connectedSockets);

			const entry = await this.prismaService.user.findUnique({
				where: {
					id: userId,
				}
			});

			const messagePayload = {
				userId: userId,
				nickname: entry.nickname,
			};

			// leave room
			client.leave(message.channelId.toString());

			const UserSockets = this.socketService.getSockets(userId, 'chat');

			filteredSockets.forEach(socket => {
				if (UserSockets.includes(socket.id))
					socket.emit('leaveChannelSelf', { message: 'you have left the channel', channelId: message.channelId });
				else
					socket.emit('leaveChannelOthers', messagePayload);
			});
		} catch (err) {
			console.log('something went wrong-');
			console.log(err);
			server.to(client.id).emit('Invalid access', { error: "error occured" });
		}
	}

	async createChannel(server: Namespace, client: Socket, message: any) {

		try {
			client.join(message.channelId.toString());
			client.emit('channelCreated', 'Channel created successfully!');
		} catch (err) {
			console.log('something went wrong-');
			console.log(err);
			server.to(client.id).emit('Invalid access', { error: "error occured" });
		}
	}

	async kickChannelMember(server: Namespace, client: Socket, message: any) {
		try {
			console.log('printing message');
			console.log(message);
			const res = await fetch(`${process.env.API_URL}/chatHttp/kickChannelMember`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					"Authorization": "Bearer " + client.handshake.query['accessToken'],
				},
				body: JSON.stringify(message)
			});
			// ?
			if (!res.ok) {
				console.log('something went wrong');
				const data = await res.json();
				console.log(data);
				server.to(client.id).emit('Invalid access', { error: "error occured" });
				return;
			}

			const socketIds = this.socketService.getSockets(+message.profileId, 'chat');
			socketIds.forEach(socketId => {
				server.sockets.get(socketId).emit('kickChannelMember', { message: 'you have been kicked', channelId: message.channelId });
				server.sockets.get(socketId).leave(message.channelId.toString());
			});
		} catch (err) {
			// console.log(err);
			server.to(client.id).emit('Invalid access', { error: "error occured" });
		}
	}

	async banChannelMember(server: Namespace, client: Socket, message: any) {
		try {
			const res = await fetch(`${process.env.API_URL}/chatHttp/banChannelMember`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					"Authorization": "Bearer " + client.handshake.query['accessToken'],
				},
				body: JSON.stringify(message)
			});
			if (!res.ok) {
				console.log('something went wrong');
				server.to(client.id).emit('Invalid access', { error: "error occured" });
				return;
			}

			const socketIds = this.socketService.getSockets(+message.profileId, 'chat');
			socketIds.forEach(socketId => {
				server.sockets.get(socketId).emit('banChannelMember', { message: 'you have been banned', channelId: message.channelId });
				server.sockets.get(socketId).leave(message.channelId.toString());
			});
		} catch (err) {
			// console.log(err);
			server.to(client.id).emit('Invalid access', { error: "error occured" });
		}
	}

	async muteChannelMember(server: Namespace, client: Socket, message: any) {
		try {
			const res = await fetch(`${process.env.API_URL}/chatHttp/muteChannelMember`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					"Authorization": "Bearer " + client.handshake.query['accessToken'],
				},
				body: JSON.stringify(message)
			});
			if (!res.ok) {
				console.log('something went wrong');
				server.to(client.id).emit('Invalid access', { error: "error occured" });
				return;
			}

			const socketIds = this.socketService.getSockets(+message.profileId, 'chat');
			socketIds.forEach(socketId => {
				server.sockets.get(socketId).emit('muteChannelMember', { message: 'you have been muted for 2 minutes', channelId: message.channelId });
			});
		} catch (err) {
			// console.log(err);
			server.to(client.id).emit('Invalid access', { error: "error occured" });
		}
	}
}
