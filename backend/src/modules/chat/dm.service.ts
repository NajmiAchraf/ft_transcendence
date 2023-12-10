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
				server.to(client.id).emit('Invalid', { error: "error occured" });
				return;
			}
			const senderId = this.socketService.getUserId(client.id);
			const receiverSockets = this.socketService.getSockets(message.receiverId);
			const senderSockets = this.socketService.getSockets(senderId);
			receiverSockets.forEach(socket => {
				server.to(socket).emit('receiveDM', message);
			});
			senderSockets.forEach(socket => {
				server.to(socket).emit('receiveDM', message);
			});
			//! message: { senderId, avatar, message, created_at, status }
		} catch (err) {
			server.to(client.id).emit('Invalid access', { error: "error occured" });
		}
	}
}
