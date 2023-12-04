import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { ChannelPasswordDto } from "../chatHttp/dto/channel_password.dto";
import { SocketService } from "src/common/services/socket.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChannelChatService {
	constructor(private readonly socketService: SocketService,
		private readonly prismaService: PrismaService) { }

	async joinChannel(server: Server, client: Socket, message: any) {
		try {
			const res = await fetch(`${process.env.API_URL}/chatHttp/joinChannel`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + client.handshake.query['accessToken'],
				},
				body: JSON.stringify(message)
			});
			if (!res.ok) {
				console.log('something went wrong');
				server.to(client.id).emit('Invalid', { error: "error occured" });
				return;
			}
			console.log('here\n');
			const data = await res.json();
			const profileId = this.socketService.getUserId(client.id);
			const socketIds = this.socketService.getSockets(profileId, 'chat');

			socketIds.forEach(socketId => {
				server.sockets.sockets[socketId].join(message.channelId);
			});
			const user = await this.prismaService.user.findUnique({ where: { id: this.socketService.getUserId(client.id) } });
			server.to(message.channelId).emit('joined', { id: user.id, nickname: user.nickname });
		} catch (err) {
			console.log('something went wrong-');
			console.log(err);
			server.to(client.id).emit('Invalid access', { error: err });
		}
	}

	async addChannelMember(server: Server, client: Socket, message: any) {
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
				server.to(client.id).emit('Invalid', { error: "error occured" });
				return;
			}

			// !send a notification
			const socketIds = this.socketService.getSockets(+message.profileId, 'chat');
			socketIds.forEach(socketId => {
				server.to(socketId).emit('addChannelMember', 'you have been added to a channel');
			});

			await this.prismaService.notification.create({
				data: {
					notification_text: 'You have been added to a channel',
					user_id: +message.profileId,
				}
			});

			server.to(client.id).emit('addChannelMember', 'user added to channel');
		} catch (err) {
			console.log(err);
			server.to(client.id).emit('Invalid access', { error: err });
		}
	}

	async addChannelAdmin(server: Server, client: Socket, message: any) {
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
				server.to(client.id).emit('Invalid', { error: "error occured" });
				return;
			}
			console.log('here\n');

			// get client id from profile id
			const newMemberSocketIds = this.socketService.getSockets(+message.profileId, 'chat');
			// emit to all sockets of the user
			newMemberSocketIds.forEach(socketId => {
				server.to(socketId).emit('addChannelAdmin', 'you have become admin');
			});

			// !send a notification
			await this.prismaService.notification.create({
				data: {
					notification_text: 'You have become admin of a channel',
					user_id: +message.profileId,
				}
			});

			server.to(client.id).emit('addChannelMember', 'user added to channel');
		} catch (err) {
			console.log('something went wrong-');
			console.log(err);
			server.to(client.id).emit('Invalid access', { error: err });
		}
	}


	async channelCreateChat(server: Server, client: Socket, message: any) {
		try {
			const res = await fetch(`${process.env.API_URL}/chatHttp/createChannelMessage`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + client.handshake.query['accessToken'],
				},
				body: JSON.stringify(message)
			});
			console.log('here\n');
			if (!res.ok) {
				console.log('something went wrong');
				server.to(client.id).emit('Invalid', { error: "error occured" });
				return;
			}
			server.to(message.channelId).emit('createChannelMessage', { success: 'message sent' });
		} catch (err) {
			console.log('something went wrong-');
			console.log(err);
			server.to(client.id).emit('Invalid access', { error: "error occured" });
		}
	}
}
