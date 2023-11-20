import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { MessageDto } from './dto/message.dto';
// import { UpdateChatDto } from './dto/update-chat.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';
import { SocketService } from 'src/common/services/socket.service';

@Injectable()
@WebSocketGateway({
	namespace: 'chat',
	cors: {
		origin: 'http://localhost:8000',
	}
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private readonly chatService: ChatService,
		private readonly prismaService: PrismaService,
		private readonly globalHelperService: GlobalHelperService,
		private readonly socketService: SocketService) { }

	async handleConnection(client: Socket) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('error', { error: 'Invalid Access Token' });
			client.disconnect();
			return;
		}
		// insert new connection
		this.socketService.insert(client.id, userId);

		// update user status to online
		await this.prismaService.user.update({
			where: {
				id: userId,
			},
			data: {
				status: 'online',
			}
		});
	}

	async handleDisconnect(client: Socket) {
		this.chatService.socketDisconnect(client);
	}

	@SubscribeMessage('createChat')
	async create(@ConnectedSocket() client: Socket, @MessageBody() message: string) {
		console.log(`createChat emmited by ${client.id}: message: ${message}`);
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('Invalid', { error: 'Invalid Access Token' });
			return;
		}
		return this.chatService.create(this.server, client, message);
	}

	@SubscribeMessage('findAllChat')
	findAll() {
		return this.chatService.findAll(this.server);
	}

	@SubscribeMessage('updateChat')
	async update(@ConnectedSocket() client: Socket, @MessageBody() messageDto: MessageDto) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('Invalid', { error: 'Invalid Access Token' });
			return;
		}
		return this.chatService.update(this.server, client, userId, messageDto);
	}

	@SubscribeMessage('removeChat')
	async remove(@ConnectedSocket() client: Socket, @MessageBody() messageDto: MessageDto) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('Invalid', { error: 'Invalid Access Token' });
			return;
		}
		return this.chatService.remove(this.server, client, userId, messageDto);
	}
}
