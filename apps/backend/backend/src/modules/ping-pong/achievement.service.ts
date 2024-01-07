import { Injectable } from "@nestjs/common";

import { GameResultType } from "src/modules/ping-pong/common/Common";

import { PrismaService } from "src/modules/prisma/prisma.service";

@Injectable()
export class AchievementService {
	constructor(private readonly prismaService: PrismaService) { }

	async Novice(userId: number) {
		// check that the user has not already received the achievement
		const entry = await this.prismaService.user_achievement.findFirst({
			where: {
				achievement_title: 'Welcome',
				user_id: userId,
			},
		});

		if (entry)
			return;

		// insert achievement
		const achievement = await this.prismaService.user_achievement.create({
			data: {
				achievement_title: 'Welcome',
				user_id: userId,
			}
		});
	}

	async PerfectTen(winnerId: number, loserScore: number, winnerScore: number) {

		if (loserScore !== 0 || winnerScore !== 10)
			return;

		// check that the user has not already received the achievement
		const entry = await this.prismaService.user_achievement.findFirst({
			where: {
				achievement_title: 'PerfectTen',
				user_id: winnerId,
			},
		});

		if (entry)
			return;

		// insert achievement
		const achievement = await this.prismaService.user_achievement.create({
			data: {
				achievement_title: 'PerfectTen',
				user_id: winnerId,
			}
		});
	}

	async PointCollector(userId: number) {
		// check if the user has already received the achievement
		const entry = await this.prismaService.user_achievement.findFirst({
			where: {
				achievement_title: 'PointCollector',
				user_id: userId,
			},
		});

		if (entry)
			return;

		// check if the user has at least 500 points
		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				total_points: true,
			}
		});

		if (user.total_points < 500)
			return;

		// insert achievement
		const achievement = await this.prismaService.user_achievement.create({
			data: {
				achievement_title: 'PointCollector',
				user_id: userId,
			}
		});
	}

	async EnduranceMaster(userId: number, startTime: Date, endTime: Date) {
		// check that the user has not already received the achievement
		const entry = await this.prismaService.user_achievement.findFirst({
			where: {
				achievement_title: 'EnduranceMaster',
				user_id: userId,
			},
		});

		if (entry)
			return;

		// calculate the duration of the match
		const Duration = endTime.getMinutes() - startTime.getMinutes();

		if (Duration < 30)
			return;

		// insert achievement
		await this.prismaService.user_achievement.create({
			data: {
				achievement_title: 'EnduranceMaster',
				user_id: userId,
			}
		});
	}

	async QuickFinisher(winnerId: number, startTime: Date, endTime: Date) {
		// check that the user has not already received the achievement
		const entry = await this.prismaService.user_achievement.findFirst({
			where: {
				achievement_title: 'QuickFinisher',
				user_id: winnerId,
			},
		});

		if (entry)
			return;

		// calculate the duration of the match
		const Duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

		if (Duration > 5)
			return;

		// insert achievement
		await this.prismaService.user_achievement.create({
			data: {
				achievement_title: 'QuickFinisher',
				user_id: winnerId,
			}
		});
	}

	async IamAHuman(loserId: number, isWinnerBot: boolean) {
		// check that the bot won
		if (!isWinnerBot)
			return;

		// check that the user has not already received the achievement
		const entry = await this.prismaService.user_achievement.findFirst({
			where: {
				achievement_title: 'IamAHuman',
				user_id: loserId,
			},
		});

		if (entry)
			return;

		// insert achievement
		const achievement = await this.prismaService.user_achievement.create({
			data: {
				achievement_title: 'IamAHuman',
				user_id: loserId,
			},
		});
	}

	async Cyborg(userId: number, userScore: number) {
		// check that the user has not already received the achievement
		const entry = await this.prismaService.user_achievement.findFirst({
			where: {
				achievement_title: 'Cyborg',
				user_id: userId,
			},
		});

		if (entry)
			return;

		// check that the user scored at least 1 point
		if (userScore < 1)
			return;

		// insert achievement
		const achievement = await this.prismaService.user_achievement.create({
			data: {
				achievement_title: 'Cyborg',
				user_id: userId,
			},
		});
	}

	async SpeedRun(userId: number) {
		// check that the user has not already received the achievement
		const entry = await this.prismaService.user_achievement.findFirst({
			where: {
				achievement_title: 'SpeedRun',
				user_id: userId,
			},
		});

		if (entry)
			return;

		// check that the user has played at least 10 matches
		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				loss_count: true,
				win_count: true,
			}
		});

		if (user.loss_count + user.win_count < 10)
			return;

		// get the last 10 matches
		const matches = await this.prismaService.game.findMany({
			where: {
				winner_id: userId,
			},
			select: {
				started_at: true,
				finished_at: true,
			},
			orderBy: {
				finished_at: 'desc',
			},
			take: 10,
		});
		if (!matches || matches.length !== 10) {
			return;
		}
		// check that the last 10 matches were played in less than 30 minutes
		const duration = (matches[0].finished_at.getTime() - matches[matches.length - 1].started_at.getTime()) / (1000 * 60);

		if (duration > 30)
			return;

		// insert achievement
		const achievement = await this.prismaService.user_achievement.create({
			data: {
				achievement_title: 'SpeedRun',
				user_id: userId,
			},
		});
	}

	async Streaker(winnerId: number) {
		// check that the user has not already received the achievement
		const entry = await this.prismaService.user_achievement.findFirst({
			where: {
				achievement_title: 'Streaker',
				user_id: winnerId,
			}
		});

		if (entry)
			return;

		// check that the user has won 3 matches in a row
		const matches = await this.prismaService.game.findMany({
			where: {
				OR: [
					{
						winner_id: winnerId,
					},
					{
						loser_id: winnerId,
					},
				],
			},
			orderBy: {
				created_at: 'desc',
			},
			take: 3,
		});

		if (matches.length !== 3)
			return;

		if (matches[0].winner_id !== winnerId
			|| matches[1].winner_id !== winnerId
			|| matches[2].winner_id !== winnerId)
			return;

		// insert achievement
		const achievement = await this.prismaService.user_achievement.create({
			data: {
				achievement_title: 'Streaker',
				user_id: winnerId,
			},
		});
	}

	async GrandMaster(winnerId: number) {
		// check that the user has not already received the achievement
		const entry = await this.prismaService.user_achievement.findFirst({
			where: {
				achievement_title: 'GrandMaster',
				user_id: winnerId,
			}
		});

		if (entry)
			return;

		// check that the user has won 3 matches in a row
		const matches = await this.prismaService.game.findMany({
			where: {
				OR: [
					{
						winner_id: winnerId,
					},
					{
						loser_id: winnerId,
					},
				],
			},
			orderBy: {
				created_at: 'desc',
			},
			take: 30,
		});

		if (matches.length !== 30)
			return;

		if (matches[0].winner_id !== winnerId
			|| matches[1].winner_id !== winnerId
			|| matches[2].winner_id !== winnerId)
			return;

		// insert achievement
		const achievement = await this.prismaService.user_achievement.create({
			data: {
				achievement_title: 'GrandMaster',
				user_id: winnerId,
			},
		});
	}

	async Boomer(loserId: number) {
		// check that the user has not already received the achievement
		const entry = await this.prismaService.user_achievement.findFirst({
			where: {
				achievement_title: 'Boomer',
				user_id: loserId,
			},
		});

		if (entry)
			return;

		// insert achievement
		const achievement = await this.prismaService.user_achievement.create({
			data: {
				achievement_title: 'Boomer',
				user_id: loserId,
			},
		});
	}

	async PingPongMaster(winnerId: number) {
		// check that the user has not already received the achievement
		const entry = await this.prismaService.user_achievement.findFirst({
			where: {
				achievement_title: 'PingPongMaster',
				user_id: winnerId,
			},
		});

		if (entry)
			return;

		// insert achievement
		const achievement = await this.prismaService.user_achievement.create({
			data: {
				achievement_title: 'PingPongMaster',
				user_id: winnerId,
			},
		});
	}

	async UpdateAchievements(gameResult: GameResultType) {
		// update achievements
		if (gameResult.winnerId !== undefined) {
			await this.Novice(gameResult.winnerId);
			await this.PerfectTen(gameResult.winnerId, gameResult.loserScore, gameResult.winnerScore);
			await this.PointCollector(gameResult.winnerId);
			await this.EnduranceMaster(gameResult.winnerId, gameResult.startTime, gameResult.endTime);
			await this.QuickFinisher(gameResult.winnerId, gameResult.startTime, gameResult.endTime);
			await this.SpeedRun(gameResult.winnerId);
			await this.Streaker(gameResult.winnerId);
			await this.GrandMaster(gameResult.winnerId);
		}
		if (gameResult.loserId !== undefined) {
			console.log('set loser achievements');
			await this.Novice(gameResult.loserId);
			await this.PointCollector(gameResult.loserId);
			await this.EnduranceMaster(gameResult.loserId, gameResult.startTime, gameResult.endTime);
			await this.IamAHuman(gameResult.loserId, (gameResult.winnerId === undefined));
			await this.SpeedRun(gameResult.loserId);
			await this.Boomer(gameResult.loserId);
		}
		if (gameResult.winnerId === undefined || gameResult.loserId === undefined) {
			await this.Cyborg(gameResult.winnerId ? gameResult.winnerId : gameResult.loserId,
				gameResult.winnerId ? gameResult.winnerScore : gameResult.loserScore);
			if (gameResult.winnerId !== undefined)
				await this.PingPongMaster(gameResult.winnerId);
		}
	}
}

// Ping Pong Novice: Play your first match in the game.
// Perfect Ten: Achieve a score of 10-0 in a match.
// Point Collector: Score a total of 500 points across all matches.
// Endurance Master: Play a single match that lasts longer than 30 minutes.
// Quick Finisher: Win a match in under 5 minutes.
// IamAHuman: lost against bot
// cyborg: 1 scored point versus a bot
// Speed Run: 10 matches in less than 30 min
// streaker: 3 won matches in a row
// grandMaster: won 30 matches in a row
// boomer: lost the first match
// pingPongMaster: won against the bot