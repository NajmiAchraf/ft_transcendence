import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { GlobalHelperService } from "./global_helper.service";

@Injectable()
export class SocketService {
	chatSockets: Map<string, number> = new Map();
	pingPongSockets: Map<string, number> = new Map();

	constructor(private readonly prismaService: PrismaService,
		private readonly globalHelperService: GlobalHelperService) {
	}

	// inserts a new PingPong connection
	insert(clientId: string, UserId: number) {
		this.pingPongSockets.set(clientId, UserId);
		return UserId;
	}

	// inserts a new chat connection
	insertChat(client: Socket, UserId: number) {
		this.chatSockets.set(client.id, UserId);
		return UserId;
	}

	// deletes a connection
	delete(clientId: string, namespace: string = 'chat') {
		const userId = namespace === 'chat' ? this.chatSockets.get(clientId) : this.pingPongSockets.get(clientId);

		if (userId === undefined)
			return undefined;
		if (namespace === 'chat') {
			this.chatSockets.delete(clientId);
		}
		else
			this.pingPongSockets.delete(clientId);
		return userId;
	}

	// get all sockets of a user
	getSockets(userId: number, namespace: string = 'chat') {
		const socketIds = [];

		if (namespace === 'chat')
			this.chatSockets.forEach((value, key) => {
				if (value === userId)
					socketIds.push(key);
			});
		else {
			this.pingPongSockets.forEach((value, key) => {
				if (value === userId)
					socketIds.push(key);
			});
		}
		return socketIds;
	}


	// get all chat connected sockets
	// getChatSocketObjs(): Socket[] {
	// 	return Array.from(this.chatSocketObjs.values());
	// }

	// getSocketObj(clientId: string) {
	// 	return this.chatSocketObjs.get(clientId);
	// }

	// get user id
	getUserId(clientId: string, namespace: string = 'chat') {
		return namespace === 'chat' ? this.chatSockets.get(clientId) : this.pingPongSockets.get(clientId);
	}

	// filter sockets by checking if client that uiser trying to emit is blocked
	async filterSockets(userId: number, connectedSockets: Socket[]): Promise<Socket[]> {

		const filteredSocketsPromises = connectedSockets.filter(async (socket) => {
			const socketUserId = this.getUserId(socket.id);

			return !(await this.globalHelperService.isBlocked(userId, socketUserId) || await this.globalHelperService.isBlocked(socketUserId, userId));
		});

		const filteredSockets = await Promise.all(filteredSocketsPromises);
		return filteredSockets;
	}
}
