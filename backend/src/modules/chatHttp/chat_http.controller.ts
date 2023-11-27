import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ChatHttpService } from './chat_http.service';
import { Request } from 'express';
import { ChatBlockCheckGuard } from 'src/common/guards';
import { ChatBlockPublic } from 'src/common/Decorators';

@Controller('chatHttp')
export class ChatHttpController {
	constructor(private readonly channelService: ChatHttpService) { }

	@UseGuards(ChatBlockCheckGuard)
	@Post('last_dm')
	async getLastDM(@Body() body: any, @Req() req: Request) {
		const profileId = +body.profileId;
		const userId = req.user['sub'];
		return this.channelService.getLastDM(userId, profileId);
	}

	@UseGuards(ChatBlockCheckGuard)
	@Post('dm_history')
	async getDMHistory(@Body() body: any, @Req() req: Request) {
		const profileId = +body.profileId;
		const userId = req.user['sub'];
		return this.channelService.getDMHistory(userId, profileId);
	}

	@Post('findAllGlobalChat')
	async findAllGlobalChat(@Req() req: Request) {
		const userId = req.user['sub'];
		return this.channelService.findAllGlobalChat(userId);
	}


}
