import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { GlobalChatService } from './global_chat.service';
import { Injectable } from '@nestjs/common';
import { GlobalHelperService } from 'src/common/services/global_helper.service';
import { ConnectionService } from './connection.service';
import { ChannelChatService } from './channel_chat.service';
import { DmService } from './dm.service';

@Injectable()
@WebSocketGateway({
	namespace: 'chat',
	cors: {
		origin: 'http://localhost:3000',
	}
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Namespace;

	constructor(private readonly globalChatService: GlobalChatService,
		private readonly globalHelperService: GlobalHelperService,
		private readonly connectionService: ConnectionService,
		private readonly channelChatService: ChannelChatService,
		private readonly dmService: DmService) { }

	async handleConnection(client: Socket) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);
		if (userId === undefined) {
			this.server.to(client.id).emit('Invalid access', { error: 'Invalid Access Token' });
			client.disconnect();
			return;
		}
		await this.connectionService.socketConnect(client, userId);
	}

	async handleDisconnect(client: Socket) {
		await this.connectionService.socketDisconnect(client);
	}

	// ** Global Chat **
	@SubscribeMessage('GlobalCreate')
	async create(@ConnectedSocket() client: Socket, @MessageBody() message: string) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('Invalid access', { error: 'Invalid Access Token' });
			return;
		}

		return this.globalChatService.create(this.server, client, message);
	}

	@SubscribeMessage('getAllUsers')
	async getUsers(@ConnectedSocket() client: Socket) {
		this.server.to(client.id).emit('users', await this.globalChatService.getUsers());
	}

	// ** Channel Chat **
	@SubscribeMessage('joinChannel')
	async joinChannel(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('Invalid access', { error: 'Invalid Access Token' });
			return;
		}
		return this.channelChatService.joinChannel(this.server, client, message);
	}

	@SubscribeMessage('addChannelMember')
	async addChannelMember(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('Invalid access', { error: 'Invalid Access Token' });
			return;
		}
		return this.channelChatService.addChannelMember(this.server, client, message);
	}

	@SubscribeMessage('addChannelAdmin')
	async addChannelAdmin(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('Invalid access', { error: 'Invalid Access Token' });
			return;
		}
		return this.channelChatService.addChannelAdmin(this.server, client, message);
	}

	@SubscribeMessage('channelCreateChat')
	async channelCreateChat(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('Invalid access', { error: 'Invalid Access Token' });
			return;
		}
		return this.channelChatService.channelCreateChat(this.server, client, message);
	}

	@SubscribeMessage('leaveChannel')
	async leaveChannel(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('Invalid access', { error: 'Invalid Access Token' });
			return;
		}
		return this.channelChatService.leaveChannel(this.server, client, message);
	}

	@SubscribeMessage('kickChannelMember')
	async kickChannelMember(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('Invalid access', { error: 'Invalid Access Token' });
			return;
		}
		return this.channelChatService.kickChannelMember(this.server, client, message);
	}

	@SubscribeMessage('banChannelMember')
	async banChannelMember(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('Invalid access', { error: 'Invalid Access Token' });
			return;
		}
		return this.channelChatService.banChannelMember(this.server, client, message);
	}

	// ** Direct Chat **
	@SubscribeMessage('directCreateChat')
	async directCreateChat(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		const userId = await this.globalHelperService.getClientIdFromJwt(client);

		if (userId === undefined) {
			this.server.to(client.id).emit('Invalid access', { error: 'Invalid Access Token' });
			return;
		}
		return this.dmService.directCreateChat(this.server, client, message);
	}
}
