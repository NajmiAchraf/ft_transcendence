import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/modules/prisma/prisma.service";

@Injectable()
export class SocketService {
	chatSockets: Map<string, number> = new Map();
	pingPongSockets: Map<string, number> = new Map();

	constructor(private readonly prismaService: PrismaService) { }

	// inserts a new connection
	insert(clientId: string, UserId: number, namespace: string = 'chat') {
		if (namespace === 'PingPong')
			this.pingPongSockets.set(clientId, UserId);
		else
			this.chatSockets.set(clientId, UserId);
		return UserId;
	}

	// deletes a connection
	delete(clientId: string, namespace: string = 'chat') {
		const userId = namespace === 'PingPong' ? this.pingPongSockets.get(clientId) : this.chatSockets.get(clientId);

		if (namespace === 'PingPong')
			this.pingPongSockets.delete(clientId);
		else
			this.chatSockets.delete(clientId);
		return userId;
	}

	// get all sockets of a user
	getSockets(userId: number, namespace: string = 'chat') {
		const sockets = [];

		if (namespace === 'PingPong')
			this.pingPongSockets.forEach((value, key) => {
				if (value === userId)
					sockets.push(key);
			});
		else {
			this.chatSockets.forEach((value, key) => {
				if (value === userId)
					sockets.push(key);
			});
		}
		return sockets;
	}

	// get user id
	getUserId(clientId: string, namespace: string = 'chat') {
		return namespace === 'chat' ? this.chatSockets.get(clientId) : this.pingPongSockets.get(clientId);
	}
}
