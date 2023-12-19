import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Namespace, Socket } from 'socket.io';
import { SocketService } from "src/common/services/socket.service";

@Injectable()
export class DmService {
	constructor(private readonly prismaService: PrismaService,
		private readonly socketService: SocketService) { }

	async directCreateChat(server: Namespace, client: Socket, message: any) {
		try {
			const res = await fetch(`${process.env.API_URL}/chatHttp/create_dm`, {
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
			const senderId = this.socketService.getUserId(client.id);
			const receiverSockets = this.socketService.getSockets(message.profileId);
			const senderSockets = this.socketService.getSockets(senderId);

			const [entry] = await this.prismaService.direct_message.findMany({
				where: {
					AND: [
						{ sender_id: senderId },
						{ receiver_id: message.profileId },
					]
				},
				include: {
					dm_sender: true,
				},
				orderBy: {
					created_at: 'desc',
				},
				take: 1,
			});

			const messagePayload = {
				sender_id: senderId,
				nickname: entry.dm_sender.nickname,
				avatar: entry.dm_sender.avatar,
				message_text: message.message,
				created_at: entry.created_at,
				status: entry.dm_sender.status,
			};

			receiverSockets.forEach(socket => {
				server.to(socket).emit('receiveDM', messagePayload);
			});
			senderSockets.forEach(socket => {
				server.to(socket).emit('receiveDM', messagePayload);
			});
			//! message: { senderId, avatar, message, created_at, status }
		} catch (err) {
			server.to(client.id).emit('Invalid access', { error: "error occured" });
		}
	}

	async acceptGameInvitation(server: Namespace, client: Socket, message: any) {
		try {
			const res = await fetch(`${process.env.API_URL}/chatHttp/acceptGameInvitation`, {
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
			const receiverId = this.socketService.getUserId(client.id);
			const senderSockets = this.socketService.getSockets(message.profileId);
			const messagePayload = {
				sender_id: message.profileId,
				receiver_id: receiverId,
			};

			client.emit('gameInvitationAccepted', messagePayload);
			senderSockets.forEach(socket => {
				server.to(socket).emit('gameInvitationAccepted', messagePayload);
			});
		} catch (err) {
			server.to(client.id).emit('Invalid access', { error: "error occured" });
		}
	}

	async sendGameInvitation(server: Namespace, client: Socket, message: any) {
		try {
			const res = await fetch(`${process.env.API_URL}/chatHttp/sendGameInvitation`, {
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
			const senderId = this.socketService.getUserId(client.id);
			const receiverSockets = this.socketService.getSockets(message.profileId);
			const messagePayload = {
				sender_id: senderId,
				receiver_id: message.profileId,
			};

			client.emit('sendGameInvitation', messagePayload);
			receiverSockets.forEach(socket => {
				server.to(socket).emit('sendGameInvitation', messagePayload);
			});
		} catch (err) {
			server.to(client.id).emit('Invalid access', { error: "error occured" });
		}
	}
}
