import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Namespace, Socket } from 'socket.io';

@Injectable()
export class DmService {
	constructor(private readonly prismaService: PrismaService) { }

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
			server.to(client.id).emit('directCreateChat', 'directCreateChat');
			server.to(message.receiverId).emit('directCreateChat', 'directCreateChat');
		} catch (err) {
			server.to(client.id).emit('Invalid access', { error: "error occured" });
		}
	}
}
