import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';

@Injectable()
export class HomeService {
	constructor(private readonly prismaService: PrismaService,
		private readonly globalHelperService: GlobalHelperService) { }

	async getFriendList(userId: number) {
		const friends = await this.prismaService.friends.findMany({
			where: { OR: [{ user1_id: userId }, { user2_id: userId }] },
			include: { user1: true, user2: true },
		});

		const friendList = friends.map((friendship) => {
			const friend = userId === friendship.user1_id ? friendship.user2 : friendship.user1;
			let friendStatus = friend.status;

			if (friendStatus === 'online' && friend.in_game === true) {
				friendStatus = 'in_game';
			}

			return {
				id: friend.id,
				nickname: friend.nickname,
				avatar: friend.avatar,
				status: friendStatus,
			};
		});
		return friendList;
	}

	async getRecentMatches(userId: number) {
		const entries = await this.prismaService.game.findMany({
			orderBy: { created_at: 'desc' },
			include: { winner: true, loser: true },
		});

		const filteredEntries = entries.filter(entry => {
			return (entry.winner_id && entry.loser_id);
		});

		const RecentMatches = filteredEntries.map((match) => {
			return {
				winner: {
					id: match.winner.id,
					nickname: match.winner.nickname,
					avatar: match.winner.avatar,
					points: match.winner_goals,
				},
				loser: {
					id: match.loser.id,
					nickname: match.loser.nickname,
					avatar: match.loser.avatar,
					points: match.loser_goals,
				},
				startedAt: match.started_at,
			};
		});

		// filtering out blocked users
		// const filteredRecentMatches = [];

		// for (let i = 0; i < RecentMatches.length; i++) {
		// 	const adversaryId = userId === RecentMatches[i].winner.id ? RecentMatches[i].loser.id : RecentMatches[i].winner.id;
		// 	if (!await this.globalHelperService.isBlocked(userId, adversaryId))
		// 		filteredRecentMatches.push(RecentMatches[i]);
		// }

		// return filteredRecentMatches;
		return RecentMatches.slice(0, 4);
	}

	async getStandings(userId: number) {
		const entries = await this.prismaService.user.findMany({
			where: {
				nickname: {
					not: null,
				}
			},
			orderBy: { total_points: 'desc' },
		});

		const players = entries.map(async (player) => {
			const status = userId === player.id ? 'self' : 'other';
			const entries = await this.prismaService.game.findMany({
				where: {
					OR: [
						{ loser_id: player.id },
						{ winner_id: player.id },
					],
				},
				orderBy: {
					created_at: 'desc',
				},
				take: 5,
			});
			const last_five_matches = entries.map((match) => {
				return player.id === match.winner_id ? 'W' : 'L';
			});
			return {
				id: player.id,
				nickname: player.nickname,
				winCount: player.win_count,
				lossCount: player.loss_count,
				totalPoints: player.total_points,
				status,
				last_five_matches,
			}
		});
		return Promise.all(players);
	}

	async search(userId: number, pattern: string) {
		if (pattern === undefined) {
			throw new ForbiddenException('Pattern not provided');
		}
		let users = await this.prismaService.user.findMany({
			where: {
				nickname: {
					startsWith: pattern,
				},
			},
		});
		let filteredUsers = [];

		for (let i = 0; i < users.length; i++) {
			if (await this.globalHelperService.isBlocked(userId, users[i].id) === false)
				filteredUsers.push(users[i]);
		}
		return filteredUsers.map((user) => {
			return {
				id: user.id,
				nickname: user.nickname,
				avatar: user.avatar,
			}
		});
	}
}
