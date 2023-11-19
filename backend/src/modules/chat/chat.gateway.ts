import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { GlobalChatDto, RemoveChatDto } from './dto/global_chat.dto';
// import { UpdateChatDto } from './dto/update-chat.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';

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
		private readonly globalHelperService: GlobalHelperService) { }

	async handleConnection(client: Socket) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('error', { error: 'Invalid Access Token' });
			client.disconnect();
			return;
		}
		await this.prismaService.user_socket.create({
			data: {
				socket_id: client.id,
				user_id: userId,
			}
		});
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
	create(@ConnectedSocket() client: Socket, @MessageBody() globalChat: GlobalChatDto) {
		console.log(`createChat emmited by ${client.id}`);
		console.log(globalChat);
		return this.chatService.create(this.server, client, globalChat);
	}

	@SubscribeMessage('findAllChat')
	findAll() {
		return this.chatService.findAll(this.server);
	}


	@SubscribeMessage('updateChat')
	update(@ConnectedSocket() client: Socket, @MessageBody() updateChatDto) {
		return this.chatService.update(this.server, client, updateChatDto);
	}

	@SubscribeMessage('removeChat')
	remove(@ConnectedSocket() client: Socket, @MessageBody() removeChatDto: RemoveChatDto) {
		return this.chatService.remove(this.server, client, removeChatDto);
	}
}
