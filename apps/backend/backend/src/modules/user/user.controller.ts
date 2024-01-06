import { Body, Controller, Post, Req, Get, UseGuards, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AdditionalInfo, SettingsDto, ProfileId, TwoFactorDto, FriendRequestResponseDto } from './dto';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { BlockCheckGuard } from 'src/common/guards';
import { BlockPublic, TwoFactorPublic } from 'src/common/Decorators';
import { VisibilityCheckGuard } from 'src/common/guards/visibility.guard';
import { TwoFactorService } from './twoFactor/twoFactor.service';
import { multerConfig } from 'src/common/confs/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarDto } from 'src/common/dtos/avatar.dto';

@UseGuards(BlockCheckGuard)
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService,
		private readonly twoFactorService: TwoFactorService) { }
	@BlockPublic()
	@Post('info')
	@UseInterceptors(FileInterceptor('avatar', multerConfig))
	async addMoreInfos(@Body() additionalInfos: AdditionalInfo, @UploadedFile() file: avatarDto, @Req() req: Request) {
		additionalInfos.avatar = file.path;
		// console.log(file);
		return this.userService.AddMoreInfos(additionalInfos, req.user['sub']);
	}

	@UseGuards(VisibilityCheckGuard)
	@Post('pf_infos')
	async getProfileInfos(@Body() body: ProfileId) {
		const profileId = +body.profileId;
		return this.userService.getProfileInfos(profileId);
	}

	@Post('personal_infos')
	async getPersonalInfos(@Body() body: ProfileId, @Req() req: Request) {
		const profileId = +body.profileId;
		const userId = req.user['sub'];
		return this.userService.getPersonalInfos(userId, profileId);
	}

	@UseGuards(VisibilityCheckGuard)
	@Post('friends_list')
	async getFriendList(@Body() body: ProfileId, @Req() req: Request) {
		const profileId = +body.profileId;
		const userId = req.user['sub'];
		return this.userService.getFriendList(userId, profileId);
	}

	@Post('send_friend_request')
	async sendFriendRequest(@Body() body: ProfileId, @Req() req: Request) {
		const profileId = +body.profileId;

		// * send friendship requests to the user (profileId)
		return this.userService.sendFriendRequest(profileId, req.user['sub']);
	}

	@BlockPublic()
	@Get('notifications')
	async getNotifications(@Req() req: Request) {
		const userId = req.user['sub'];

		return this.userService.getNotifications(userId);
	}
	
	@Post('cancel_friend_request')
	async cancelFriendRequest(@Body() body: ProfileId, @Req() req: Request) {
		const profileId = +body.profileId;

		// * cancel friendship requests to the user (profileId)
		return this.userService.cancelFriendRequest(profileId, req.user['sub']);
	}

	@Post('respond_to_friend_request')
	async respondToFriendRequest(@Body() body: FriendRequestResponseDto, @Req() req: Request) {
		const profileId = +body.profileId;
		const friendRequestResponse = body.friendRequestResponse;

		// * accept friendship requests from the user (profileId)
		return this.userService.respondToFriendRequest(profileId, req.user['sub'], friendRequestResponse);
	}

	@Post('remove_friend')
	async removeFriend(@Body() body: ProfileId, @Req() req: Request) {
		const profileId = +body.profileId;

		// * remove the user (profileId) from the friend list
		return this.userService.removeFriend(profileId, req.user['sub']);
	}

	@Post('block_user')
	async blockUser(@Body() body: ProfileId, @Req() req: Request) {
		const profileId = +body.profileId;

		// * block the user (profileId)
		return this.userService.blockUser(profileId, req.user['sub']);
	}

	@Post('unblock_user')
	async unblockUser(@Body() body: ProfileId, @Req() req: Request) {
		const profileId = +body.profileId;

		// * unblock the user (profileId)
		return this.userService.unblockUser(profileId, req.user['sub']);
	}

	@UseGuards(VisibilityCheckGuard)
	@Post('achievements')
	async getAchievements(@Body() body: ProfileId) {
		const profileId = +body.profileId;
		return this.userService.getAchievements(profileId);
	}

	@UseGuards(VisibilityCheckGuard)
	@Post('channels')
	async getChannels(@Body() body: ProfileId, @Req() req: Request) {
		const profileId = +body.profileId;
		const userId = req.user['sub'];
		return this.userService.getChannels(profileId, userId);
	}

	@UseGuards(VisibilityCheckGuard)
	@Post('match_history')
	async getMatchHistory(@Body() body: ProfileId, @Req() req: Request) {
		const profileId = +body.profileId;
		const userId = req.user['sub'];
		return this.userService.getMatchHistory(userId, profileId);
	}

	@BlockPublic()
	@Get('defaultSettings')
	async getDefaultSettings(@Req() req: Request) {
		const userId = req.user['sub'];
		return this.userService.getDefaultSettings(userId);
	}

	@BlockPublic()
	@Post('settings')
	async updateSettings(@Body() body: SettingsDto, @Req() req: Request) {
		const userId = req.user['sub'];
		return this.userService.updateSettings(body, userId);
	}

	@BlockPublic()
	@Post('settingsAvatar')
	@UseInterceptors(FileInterceptor('avatar', multerConfig))
	async updateSettingsAvatar(@Body() body: SettingsDto, @Req() req: Request, @UploadedFile() file: avatarDto) {
		body.avatar = file.path;
		const userId = req.user['sub'];
		return this.userService.updateSettingsAvatar(body, userId);
	}

	@BlockPublic()
	@Get('2factorQr')
	async getTwoFactorQr(@Req() req: Request) {
		const userId = req.user['sub'];
		const username = req.user['username'];
		return {img: await this.twoFactorService.getTwoFactorQr(userId, username)};
	}

	@BlockPublic()
	@Post('enable2factor')
	async enableTwoFactor(@Body() body: TwoFactorDto, @Req() req: Request) {
		const userId = req.user['sub'];
		const { code } = body;
		return await this.twoFactorService.enableTwoFactor(userId, code);
	}

	@BlockPublic()
	@TwoFactorPublic()
	@Post('check2factor')
	async checkTwoFactor(@Body() body: TwoFactorDto, @Req() req: Request) {
		const userId = req.user['sub'];
		const { code } = body;
		return await this.twoFactorService.checkTwoFactor(userId, code);
	}

	@BlockPublic()
	@Get('amIinGame')
	async amIinGame(@Req() req: Request) {
		const userId = req.user['sub'];
		return await this.userService.amIinGame(userId);
	}
}
