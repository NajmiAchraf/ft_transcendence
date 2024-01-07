import { Injectable } from "@nestjs/common";

import { AchievementService } from "src/modules/ping-pong/achievement.service";
import { GameResultType } from "src/modules/ping-pong/common/Common";

import { PrismaService } from "src/modules/prisma/prisma.service";

@Injectable()
export class PingPongService {
	constructor(private readonly prismaService: PrismaService,
		private readonly achievementService: AchievementService) { }

	async postGameLogic(gameResult: GameResultType) {

		console.log(gameResult);
		// insert game
		const entry = await this.prismaService.game.create({
			data: {
				winner_id: gameResult.winnerId,
				loser_id: gameResult.loserId,
				winner_goals: gameResult.winnerScore,
				loser_goals: gameResult.loserScore,
				started_at: gameResult.startTime,
				finished_at: gameResult.endTime,
			}
		});

		// * Check if the winner or loser is a bot
		// update players infos
		if (gameResult.winnerId)
			await this.updatePlayerInfos(true, gameResult.winnerId, gameResult.winnerScore);
		if (gameResult.loserId)
			await this.updatePlayerInfos(false, gameResult.loserId, gameResult.loserScore);

		// update achievements
		this.achievementService.UpdateAchievements(gameResult);

		// update ladder level
		this.updateLadderLevel(gameResult);
	}

	// update ladder level
	async updateLadderLevel(gameResult: GameResultType) {
		// get players
		let winner = null;
		let loser = null;

		// * check if the winner or loser is a bot
		if (gameResult.winnerId) {
			winner = await this.prismaService.user.findUnique({
				where: {
					id: gameResult.winnerId,
				},
				select: {
					level: true,
					level_percentage: true,
					total_points: true,
				}
			});
		}

		if (gameResult.loserId) {
			loser = await this.prismaService.user.findUnique({
				where: {
					id: gameResult.loserId,
				},
				select: {
					level: true,
					level_percentage: true,
					total_points: true,
				}
			});
		}

		if (winner) {
			// calculate new level
			const winnerNewLevel = this.calculateNewLevel(winner.level, winner.level_percentage, true, winner.total_points);
			await this.prismaService.user.update({
				where: { id: gameResult.winnerId },
				data: {
					level: winnerNewLevel.level,
					level_percentage: winnerNewLevel.level_percentage,
				},
			});
		}

		if (loser) {
			const loserNewLevel = this.calculateNewLevel(loser.level, loser.level_percentage, false, loser.total_points);

			// update players

			await this.prismaService.user.update({
				where: { id: gameResult.loserId },
				data: {
					level: loserNewLevel.level,
					level_percentage: loserNewLevel.level_percentage,
				},
			});
		}
	}

	// calculate new level in a logarithmic way
	calculateNewLevel(level: number, levelPercentage: number, isWinner: boolean, score: number) {
		// calculate new level in a logarithmic way
		let newLevel = level;
		let newLevelPercentage = levelPercentage;

		if (isWinner) {
			newLevelPercentage += 50;
			newLevelPercentage += 10 / (score + 1);

			if (newLevelPercentage >= 100) {
				newLevelPercentage = newLevelPercentage - 100;
				newLevel += 1;
			}
		} else {
			newLevelPercentage -= 10;
			if (newLevelPercentage < 0) {
				newLevelPercentage = 90;
				newLevel -= 1;
				if (newLevel < 0) {
					newLevel = 0;
					newLevelPercentage = 0;
				}
			}
		}
		return { level: newLevel, level_percentage: newLevelPercentage };
	}

	// update user infos
	async updatePlayerInfos(isWinner: boolean, userId: number, score: number) {

		// get highest score
		let { highest_score } = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				highest_score: true,
			}
		});

		if (score > highest_score)
			highest_score = score;

		// update user infos
		await this.prismaService.user.update({
			where: { id: userId },
			data: {
				total_points: {
					increment: score,
				},
				highest_score: highest_score,
			},
		});

		if (isWinner) {
			// update win count
			await this.prismaService.user.update({
				where: { id: userId },
				data: {
					win_count: {
						increment: 1,
					},
				},
			});
		} else {
			// update loss count
			await this.prismaService.user.update({
				where: { id: userId },
				data: {
					loss_count: {
						increment: 1,
					},
				},
			});
		}
	}
}
