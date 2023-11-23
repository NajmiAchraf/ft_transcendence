import { Body, Controller, Post, Req, Get, UseGuards, Res } from '@nestjs/common';
import { AdditionalInfo } from './dto';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { BlockCheckGuard } from 'src/common/guards';
import { BlockPublic } from 'src/common/Decorators';
import { VisibilityCheckGuard } from 'src/common/guards/visibility.guard';
import { TwoFactorService } from './twoFactor/twoFactor.service';

@UseGuards(BlockCheckGuard)
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService,
		private readonly twoFactorService: TwoFactorService) { }
	@BlockPublic()
	@Post('info')
	async addMoreInfos(@Body() additionalInfos: AdditionalInfo, @Req() req: Request) {
		return this.userService.AddMoreInfos(additionalInfos, req.user['sub']);
	}

	@UseGuards(VisibilityCheckGuard)
	@Post('pf_infos')
	async getProfileInfos(@Body() body: any) {
		const profileId = +body.profileId;
		return this.userService.getProfileInfos(profileId);
	}

	@Post('personal_infos') // ! POST request
	async getPersonalInfos(@Body() body: any, @Req() req: Request) {
		const profileId = +body.profileId;
		const userId = req.user['sub'];
		return this.userService.getPersonalInfos(userId, profileId);
	}

	@UseGuards(VisibilityCheckGuard)
	@Post('friends_list')
	async getFriendList(@Body() body: any, @Req() req: Request) {
		const profileId = +body.profileId;
		const userId = req.user['sub'];
		return this.userService.getFriendList(userId, profileId);
	}

	@UseGuards(VisibilityCheckGuard)
	@Post('achievements')
	async getAchievements(@Body() body: any) {
		const profileId = +body.profileId;
		return this.userService.getAchievements(profileId);
	}

	@UseGuards(VisibilityCheckGuard)
	@Post('channels')
	async getChannels(@Body() body: any, @Req() req: Request) {
		const profileId = +body.profileId;
		const userId = req.user['sub'];
		return this.userService.getChannels(profileId, userId);
	}

	@UseGuards(VisibilityCheckGuard)
	@Post('match_history')
	async getMatchHistory(@Body() body: any, @Req() req: Request) {
		const profileId = +body.profileId;
		const userId = req.user['sub'];
		return this.userService.getMatchHistory(userId, profileId);
	}

	// ! userID must be sent in the body
	@BlockPublic()
	@Get('defaultSettings')
	async getDefaultSettings(@Req() req: Request) {
		const userId = req.user['sub'];
		return this.userService.getDefaultSettings(userId);
	}

	@BlockPublic()
	@Post('settings')
	async updateSettings(@Body() body: any, @Req() req: Request) {
		const userId = req.user['sub'];
		return this.userService.updateSettings(body, userId);
	}

	@BlockPublic()
	@Get('2factorQr')
	async getTwoFactorQr(@Req() req: Request, @Res() res: Response) {
		const userId = req.user['sub'];
		const username = req.user['username'];
		res.json(await this.twoFactorService.getTwoFactorQr(userId, username));
	}

	@BlockPublic()
	@Post('enable2factor')
	async enableTwoFactor(@Body() body: any, @Req() req: Request) {
		const userId = req.user['sub'];
		const { code } = body;
		return await this.twoFactorService.enableTwoFactor(userId, code);
	}
}

