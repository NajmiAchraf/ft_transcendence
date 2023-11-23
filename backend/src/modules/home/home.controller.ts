import { Body, Controller, Get, Req, Post } from '@nestjs/common';
import { HomeService } from './home.service';
import { Request } from 'express';

@Controller('home')
export class HomeController {
	constructor(private readonly homeService: HomeService) { }

	@Get('friends_list')
	async getFriendList(@Req() req: Request) {
		const userId = req.user['sub'];
		return this.homeService.getFriendList(userId);
	}

	@Get('recent_4_matches')
	async getRecentMatches(@Req() req: Request) {
		const userId = req.user['sub'];
		return this.homeService.getRecentMatches(userId);
	}

	@Get('standings')
	async getStandings(@Req() req: Request) {
		const userId = req.user['sub'];
		return this.homeService.getStandings(userId);
	}

	@Post('search')
	async search(@Req() req: Request, @Body() body: any) {
		const userId = req.user['sub'];
		return await this.homeService.search(userId, body['pattern']);
	}

	@Get('whoami')
	async whoami(@Req() req: Request) {
		const userId = req.user['sub'];
		return userId;
	}
}
