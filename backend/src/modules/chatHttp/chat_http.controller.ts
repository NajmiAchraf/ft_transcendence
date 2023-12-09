import { Body, Controller, Get, HttpStatus, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ChatHttpService } from './chat_http.service';
import { Request } from 'express';
import { ChatBlockCheckGuard, BannedMemberGuard, BannedUserGuard } from 'src/common/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/common/confs/multer.config';
import { avatarDto } from 'src/common/dtos/avatar.dto';
import { ChannelIdDto, ChannelMessageDto, CreateChannelDto, DmDto, ProfileChannelIdDto } from './dto';
import { ProfileId } from '../user/dto';
import { Profile } from 'passport';
import { ChannelPasswordDto } from './dto/channel_password.dto';

@Controller('chatHttp')
export class ChatHttpController {
	constructor(private readonly chatHttpService: ChatHttpService) { }

	// @UseGuards(ChatBlockCheckGuard)
	@Post('last_dms')
	async getLastDMs(@Body() body: ProfileId, @Req() req: Request) {
		const userId = req.user['sub'];
		return this.chatHttpService.getLastDMs(userId);
	}

	@UseGuards(ChatBlockCheckGuard)
	@Post('create_dm')
	async createDM(@Req() req: Request, @Body() body: DmDto) {
		const userId = req.user['sub'];
		const receiverId = +body.receiverId;
		return this.chatHttpService.createDM(userId, receiverId, body.message);
	}

	@UseGuards(ChatBlockCheckGuard)
	@Post('dm_history')
	async getDMHistory(@Body() body: ProfileId, @Req() req: Request) {
		const profileId = +body.profileId;
		const userId = req.user['sub'];
		return this.chatHttpService.getDMHistory(userId, profileId);
	}

	@Get('findAllGlobalChat')
	async findAllGlobalChat(@Req() req: Request) {
		const userId = req.user['sub'];
		return this.chatHttpService.findAllGlobalChat(userId);
	}

	@UseGuards(BannedUserGuard)
	@Post('findChannelChat')
	async findChannelChat(@Req() req: Request, @Body() body: ChannelIdDto) {
		const userId = req.user['sub'];
		const channelId = +body.channelId;
		return this.chatHttpService.findChannelChat(userId, channelId);
	}

	@Post('createChannel')
	@UseInterceptors(FileInterceptor('avatar', multerConfig))
	async createChannel(@Body() body: CreateChannelDto, @UploadedFile() file: avatarDto, @Req() req: Request) {
		body.avatar = file.path;
		return this.chatHttpService.createChannel(body, req.user['sub']);
	}

	@Post('createChannelMessage')
	@UseGuards(BannedUserGuard)
	async createChannelMessage(@Req() req: Request, @Body() body: ChannelMessageDto) {
		const userId = req.user['sub'];
		return this.chatHttpService.createChannelMessage(userId, +body.channelId, body.message);
	}

	@UseGuards(BannedMemberGuard)
	@UseGuards(ChatBlockCheckGuard)
	@Post('addChannelMember')
	async addChannelMember(@Req() req: Request, @Body() body: ProfileChannelIdDto) {
		const userId = req.user['sub'];
		const channelId = +body.channelId;
		const memberId = +body.profileId;
		return this.chatHttpService.addChannelMember(userId, channelId, memberId);
	}

	@UseGuards(BannedMemberGuard)
	@UseGuards(ChatBlockCheckGuard)
	@Post('addChannelAdmin')
	async addChannelAdmin(@Req() req: Request, @Body() body: ProfileChannelIdDto) {
		const userId = req.user['sub'];
		const channelId = +body.channelId;
		const memberId = +body.profileId;
		return this.chatHttpService.addChannelAdmin(userId, channelId, memberId);
	}

	@UseGuards(BannedUserGuard)
	@Post('joinChannel')
	async joinChannel(@Req() req: Request, @Body() body: ChannelPasswordDto) {
		const userId = req.user['sub'];
		const channelId = +body.channelId;
		const password = body.password;
		return this.chatHttpService.joinChannel(userId, channelId, password);
	}

	@UseGuards(BannedUserGuard)
	@Post('leaveChannel')
	async leaveChannel(@Req() req: Request, @Body() body: ChannelIdDto) {
		const userId = req.user['sub'];
		const channelId = +body.channelId;
		return this.chatHttpService.leaveChannel(userId, channelId);
	}

	@UseGuards(BannedMemberGuard)
	@Post('kickChannelMember')
	async kickChannelMember(@Req() req: Request, @Body() body: ProfileChannelIdDto) {
		const userId = req.user['sub'];
		const channelId = +body.channelId;
		const memberId = +body.profileId;
		return this.chatHttpService.kickChannelMember(userId, channelId, memberId);
	}

	@UseGuards(BannedMemberGuard)
	@Post('banChannelMember')
	async banChannelMember(@Req() req: Request, @Body() body: ProfileChannelIdDto) {
		const userId = req.user['sub'];
		const channelId = +body.channelId;
		const memberId = +body.profileId;
		return this.chatHttpService.banChannelMember(userId, channelId, memberId);
	}

	@UseGuards(BannedMemberGuard)
	@Post('muteChannelMember')
	async muteChannelMember(@Req() req: Request, @Body() body: ProfileChannelIdDto) {
		const userId = req.user['sub'];
		const channelId = +body.channelId;
		const memberId = +body.profileId;
		return this.chatHttpService.muteChannelMember(userId, channelId, memberId);
	}

	@UseGuards(BannedUserGuard)
	@Post('changeChannelPassword')
	async changeChannelPassword(@Req() req: Request, @Body() body: ChannelPasswordDto) {
		const userId = req.user['sub'];
		const channelId = +body.channelId;
		const password = body.password;
		return this.chatHttpService.changeChannelPassword(userId, channelId, password);
	}

	@UseGuards(BannedUserGuard)
	@Post('removeChannelPassword')
	async removeChannelPassword(@Req() req: Request, @Body() body: ChannelIdDto) {
		const userId = req.user['sub'];
		const channelId = +body.channelId;
		return this.chatHttpService.removeChannelPassword(userId, channelId);
	}

	@UseGuards(BannedUserGuard)
	@Get('findOtherChannels')
	async findOtherChannels(@Req() req: Request) {
		const userId = req.user['sub'];
		return this.chatHttpService.findOtherChannels(userId);
	}
}

/*
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoib21hcnJyIiwiaWF0IjoxNzAxMjY4NzIxLCJleHAiOjE3MDEzNTUxMjF9.aNBerca4xpVc_4Rn2zzF5C4AQUiWuxK_SPxKdGkM10g
*/