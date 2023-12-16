import { Injectable } from "@nestjs/common";
import { Server, Socket } from 'socket.io';
import { SocketService } from "src/common/services/socket.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ConnectionService {
	constructor(private readonly socketService: SocketService,
		private readonly prismaService: PrismaService) { }

	async socketConnect(client: Socket, userId: number) {
		// insert new connection
		this.socketService.insert(client.id, userId, 'chat');

		// update user status to online
		await this.prismaService.user.update({
			where: {
				id: userId,
			},
			data: {
				status: 'online',
			}
		});
		const channels = await this.prismaService.user_channel.findMany({
			where: {
				user_id: userId,
			},
			include: {
				channel: true,
			}
		});
		channels.forEach(channel => {
			client.join(channel.channel.id.toString());
		});
	}

	async socketDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);

		// delete connection
		const userId = this.socketService.delete(client.id);

		console.log('UserID: ' + userId);
		if (userId === undefined) {
			return;
		}
		// check if user has other socket_id
		const sockets = this.socketService.getSockets(userId);

		if (sockets.length === 0) {
			await this.prismaService.user.update({
				where: {
					id: userId,
				},
				data: {
					status: 'offline',
				}
			});
		}
	}
}