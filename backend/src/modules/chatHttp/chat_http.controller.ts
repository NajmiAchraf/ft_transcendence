import { Body, Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ChatHttpService } from './chat_http.service';
import { Request } from 'express';
import { ChatBlockCheckGuard } from 'src/common/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/common/confs/multer.config';
import { avatarDto } from 'src/common/dtos/avatar.dto';
import { CreateChannelDto } from './dto';

@Controller('chatHttp')
export class ChatHttpController {
	constructor(private readonly chatHttpService: ChatHttpService) { }

	@UseGuards(ChatBlockCheckGuard)
	@Post('last_dm')
	async getLastDM(@Body() body: any, @Req() req: Request) {
		const profileId = +body.profileId;
		const userId = req.user['sub'];
		return this.chatHttpService.getLastDM(userId, profileId);
	}

	@UseGuards(ChatBlockCheckGuard)
	@Post('dm_history')
	async getDMHistory(@Body() body: any, @Req() req: Request) {
		const profileId = +body.profileId;
		const userId = req.user['sub'];
		return this.chatHttpService.getDMHistory(userId, profileId);
	}

	@Get('findAllGlobalChat')
	async findAllGlobalChat(@Req() req: Request) {
		const userId = req.user['sub'];
		return this.chatHttpService.findAllGlobalChat(userId);
	}

	@Post('createChannel')
	@UseInterceptors(FileInterceptor('avatar', multerConfig))
	async addMoreInfos(@Body() body: CreateChannelDto, @UploadedFile() file: avatarDto, @Req() req: Request) {
		body.avatar = file.path;
		return this.chatHttpService.createChannel(body, req.user['sub']);
	}

	// ! banned_guard
	@UseGuards(ChatBlockCheckGuard)
	@Post('addChannelMember')
	async addChannelMember(@Req() req: Request, @Body() body: any) {
		const userId = req.user['sub'];
		const channelId = +body.channelId;
		const memberId = +body.memberId;
		return this.chatHttpService.addChannelMember(userId, channelId, memberId);
	}

	@UseGuards(ChatBlockCheckGuard)
	@Post('addChannelAdmin')
	async addChannelAdmin(@Req() req: Request, @Body() body: any) {
		const userId = req.user['sub'];
		const channelId = +body.channelId;
		const memberId = +body.memberId;
		return this.chatHttpService.addChannelAdmin(userId, channelId, memberId);
	}

	// ! banned_guard
	@Post('joinChannel')
	async joinChannel(@Req() req: Request, @Body() body: any) {
		const userId = req.user['sub'];
		const channelId = +body.channelId;
		const password = body.password;
		return this.chatHttpService.joinChannel(userId, channelId, password);
	}
}
