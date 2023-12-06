import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdditionalInfo } from './dto';
import { UserHelperService } from './user_helper.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';

@Injectable()
export class UserService {
	constructor(private readonly prismaService: PrismaService,
		private readonly userHelperService: UserHelperService,
		private readonly globalHelperService: GlobalHelperService) { }
	async AddMoreInfos(additionalInfos: AdditionalInfo, userId: number) {
		const entry = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				nickname: true,
			}
		});

		if (entry.nickname !== null) {
			throw new ForbiddenException('Additional infos already exists');
		}
		const user = await this.prismaService.user.findUnique({
			where: {
				nickname: additionalInfos.nickname,
			},
		});
		if (user) {
			throw new ForbiddenException('Nickname already exists');
		}
		return await this.prismaService.user.update({
			where: {
				id: userId,
			},
			data: {
				nickname: additionalInfos.nickname,
				fullname: additionalInfos.fullname,
				gender: additionalInfos.gender,
				avatar: this.globalHelperService.join(process.env.API_URL, additionalInfos.avatar),
			}
		});
	}

	async getPersonalInfos(userId: number, profileId: number) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id: profileId,
			},
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		let status: string;

		if (userId === profileId) {
			status = 'self';
		}
		else if (await this.globalHelperService.isBlocked(profileId, userId)) {
			status = 'blocked';
		}
		else if (await this.globalHelperService.areFriends(profileId, userId)) {
			status = 'friend';
		}
		else {
			status = 'stranger';
		}
		if (status === 'stranger') {
			let entry = await this.prismaService.friendship_request.findFirst({
				where: {
					adding_user_id: userId,
					added_user_id: profileId,
				}
			});

			if (entry) {
				status = 'request_sent';
			}

			entry = await this.prismaService.friendship_request.findFirst({
				where: {
					adding_user_id: profileId,
					added_user_id: userId,
				}
			});

			if (entry) {
				status = 'request_received';
			}
		}
		return {
			nickname: user.nickname,
			username: user.username,
			avatar: user.avatar,
			level: user.level,
			level_percentage: user.level_percentage,
			status,
		};
	}

	async getProfileInfos(profileId: number) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id: profileId,
			},
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return {
			totalGames: user.win_count + user.loss_count,
			winPercentage: (user.win_count / (user.win_count + user.loss_count)) * 100,
			lossPercentage: (user.loss_count / (user.win_count + user.loss_count)) * 100,
			highestScore: user.highest_score,
			totalScore: user.total_points,
		};
	}

	async getFriendList(userId: number, profileId: number) {
		const friends = await this.prismaService.friends.findMany({
			where: { OR: [{ user1_id: profileId }, { user2_id: profileId }] },
			include: { user1: true, user2: true },
		});

		const friendList = friends.map(async (friendship) => {
			const friend = profileId === friendship.user1_id ? friendship.user2 : friendship.user1;
			// ! check if the user is friend request sender or receiver
			let status = userId === friend.id ? 'self' : await this.globalHelperService.areFriends(userId, friend.id) === true ? 'friend' : 'stranger';

			if (status === 'stranger') {
				let entry = await this.prismaService.friendship_request.findFirst({
					where: {
						adding_user_id: userId,
						added_user_id: friend.id,
					}
				});

				if (entry) {
					status = 'request_sent';
				}

				entry = await this.prismaService.friendship_request.findFirst({
					where: {
						adding_user_id: friend.id,
						added_user_id: userId,
					}
				});

				if (entry) {
					status = 'request_received';
				}
			}
			return {
				id: friend.id,
				nickname: friend.nickname,
				avatar: friend.avatar,
				status: status,
			};
		});
		return await Promise.all(friendList);
	}

	async getAchievements(profileId: number) {
		const achievements = await this.prismaService.user_achievement.findMany({
			where: {
				user_id: profileId,
			},
		});
		const achievementList = achievements.map((achievement) => {
			return (achievement.achievement_title);
		});
		return achievementList;
	}

	async getChannels(profileId: number, userId: number) {
		const channels = await this.prismaService.user_channel.findMany({
			where: {
				user_id: profileId,
			},
			include: {
				channel: true,
			},
		});

		const channelList = channels.map((entry) => {
			return {
				id: entry.channel.id,
				name: entry.channel.channel_name,
				avatar: entry.channel.avatar,
				privacy: entry.channel.privacy,
				members_count: entry.channel.members_count,
				isJoined: false
			};
		});

		let filteredChannelList = [];

		for (let i = 0; i < channelList.length; i++) {
			if (await this.userHelperService.isMemberOfChannel(channelList[i], userId, profileId)) {
				channelList[i].isJoined = true;
			}
			if (await this.userHelperService.isChannelVisible(channelList[i], userId, profileId)) {
				filteredChannelList.push(channelList[i]);
			}
		}

		return filteredChannelList;
	}

	async getMatchHistory(userId: number, profileId: number) {
		const matches = await this.prismaService.game.findMany({
			where: {
				OR: [
					{ loser_id: profileId },
					{ winner_id: profileId },
				],
			},
			orderBy: {
				created_at: 'desc',
			},
			include: {
				winner: true,
				loser: true,
			},
		});

		const matchList = matches.map((match) => {
			const isPlayerWinner = match.winner_id === profileId;
			const opponent = isPlayerWinner ? match.loser : match.winner;
			const playerGoals = isPlayerWinner ? match.winner_goals : match.loser_goals;
			const opponentGoals = isPlayerWinner ? match.loser_goals : match.winner_goals;
			const duration = (match.finished_at.getTime() - match.started_at.getTime()) / (1000 * 60); userId

			if (opponent === null) {
				return {
					opponent_id: -1,
					nickname: 'bot',
					avatar: '',
					goals: {
						playerGoals,
						opponentGoals,
					},
					createdAt: match.created_at,
					duration,
				};
			}

			return {
				opponent_id: opponent.id,
				nickname: opponent.nickname,
				avatar: opponent.avatar,
				goals: {
					playerGoals,
					opponentGoals,
				},
				createdAt: match.created_at,
				duration,
			};
		});

		// postfilter
		const matchesFilter = [];
		for (let i = 0; i < matchList.length; i++) {
			if (!await this.globalHelperService.isBlocked(userId, matchList[i].opponent_id)) {
				matchesFilter.push(matchList[i]);
			}
		}
		return matchesFilter;
	}

	async updateSettings(body: any, userId: number) {
		// checking if user exists
		let user = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}

		// checking if nickname already exists
		user = await this.prismaService.user.findUnique({
			where: {
				nickname: body.nickname,
			},
		});

		if (user && user.id !== userId) {
			throw new BadRequestException('Nickname already exists');
		}

		// updating user
		const updatedUser = await this.prismaService.user.update({
			where: {
				id: userId,
			},
			data: {
				visibility: body.visibility,
				avatar: body.avatar,
				nickname: body.nickname,
			},
		});

		if (body.two_factor_auth === false) {
			await this.prismaService.user.update({
				where: {
					id: userId,
				},
				data: {
					two_factor_auth: false,
					is_two_factor_authenticated: false,
				}
			});
		}

		// deleting sensitive data
		delete updatedUser.two_factor_secret;
		delete updatedUser.password;
		delete updatedUser.refresh_token;

		// ! the front end must check the 2factor in the response, in order to decide.
		return { updatedUser, two_factor_auth: body.two_factor_auth };
	}

	async updateSettingsAvatar(body: any, userId: number) {
		// checking if user exists
		let user = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}

		// checking if nickname already exists
		user = await this.prismaService.user.findUnique({
			where: {
				nickname: body.nickname,
			},
		});

		if (user && user.id !== userId) {
			throw new BadRequestException('Nickname already exists');
		}

		console.log(this.globalHelperService.join(process.env.API_URL, body.avatar));

		// updating user
		const updatedUser = await this.prismaService.user.update({
			where: {
				id: userId,
			},
			data: { // http:/
				visibility: body.visibility,
				avatar: this.globalHelperService.join(process.env.API_URL, body.avatar),
				nickname: body.nickname,
			},
		});

		if (body.two_factor_auth === false) {
			await this.prismaService.user.update({
				where: {
					id: userId,
				},
				data: {
					two_factor_auth: false,
					is_two_factor_authenticated: false,
				}
			});
		}

		// deleting sensitive data
		delete updatedUser.two_factor_secret;
		delete updatedUser.password;
		delete updatedUser.refresh_token;

		// ! the front end must check the 2factor in the response, in order to decide.
		return { updatedUser, two_factor_auth: body.two_factor_auth };
	}

	async getDefaultSettings(userId: number) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}

		return {
			username: user.username,
			visibility: user.visibility,
			avatar: user.avatar,
			nickname: user.nickname,
			two_factor_auth: user.two_factor_auth,
		};
	}

	async sendFriendRequest(profileId: number, userId: number) {

		if (profileId === userId) {
			throw new BadRequestException('You cannot send a friend request to yourself');
		}

		const entry = await this.prismaService.friendship_request.findFirst({
			where: {
				adding_user_id: userId,
				added_user_id: profileId,
			}
		});

		if (entry) {
			throw new BadRequestException('Friendship request already sent');
		}

		const friendship = await this.prismaService.friends.findFirst({
			where: {
				OR: [
					{ user1_id: userId, user2_id: profileId },
					{ user1_id: profileId, user2_id: userId },
				],
			}
		});

		if (friendship) {
			throw new BadRequestException('already friends');
		}

		const friendshipRequest = await this.prismaService.friendship_request.create({
			data: {
				adding_user_id: userId,
				added_user_id: profileId,
			}
		});
	}

	async respondToFriendRequest(profileId: number, userId: number, friendRequestResponse: string) {
		if (userId === profileId) {
			throw new BadRequestException('You can not be friend with yourself');
		}

		// check if friendship request exists
		const entry = await this.prismaService.friendship_request.findFirst({
			where: {
				adding_user_id: profileId,
				added_user_id: userId,
			}
		});

		if (!entry) {
			throw new BadRequestException('Friendship request not found');
		}

		// delete friendship request
		await this.prismaService.friendship_request.delete({
			where: {
				id: entry.id,
			}
		});

		// create friendship if accepted
		if (friendRequestResponse === 'accept') {
			await this.prismaService.friends.create({
				data: {
					user1_id: userId,
					user2_id: profileId,
				}
			});
		}
	}

	async removeFriend(profileId: number, userId: number) {
		if (userId === profileId) {
			throw new BadRequestException('You can not be friend with yourself');
		}

		const friendship = await this.prismaService.friends.findFirst({
			where: {
				OR: [
					{ user1_id: userId, user2_id: profileId },
					{ user1_id: profileId, user2_id: userId },
				],
			}
		});

		if (!friendship) {
			throw new BadRequestException('Not friends');
		}

		// delete friendship
		await this.prismaService.friends.delete({
			where: {
				id: friendship.id,
			}
		});
	}

	async blockUser(profileId: number, userId: number) {
		if (userId === profileId) {
			throw new BadRequestException('You can not block yourself');
		}

		const entry = await this.prismaService.blocked.findFirst({
			where: {
				blocking_user_id: userId,
				blocked_user_id: profileId,
			}
		});

		if (entry) {
			throw new BadRequestException('Already blocked');
		}

		// check if they are friends
		const friendship = await this.prismaService.friends.findFirst({
			where: {
				OR: [
					{ user1_id: userId, user2_id: profileId },
					{ user1_id: profileId, user2_id: userId },
				],
			}
		});

		if (friendship) {
			// delete friendship
			await this.prismaService.friends.delete({
				where: {
					id: friendship.id,
				}
			});
		}

		try {
			await this.prismaService.direct_message.deleteMany({
				where: {
					OR: [
						{ sender_id: userId, receiver_id: profileId },
						{ sender_id: profileId, receiver_id: userId },
					],
				}
			});

			// block user
			await this.prismaService.blocked.create({
				data: {
					blocking_user_id: userId,
					blocked_user_id: profileId,
				}
			});
		} catch (error) {
			throw new BadRequestException('Error while blocking user');
		}
	}

	async unblockUser(profileId: number, userId: number) {
		if (userId === profileId) {
			throw new BadRequestException('You can not unblock yourself');
		}

		const entry = await this.prismaService.blocked.findFirst({
			where: {
				blocking_user_id: userId,
				blocked_user_id: profileId,
			}
		});

		if (!entry) {
			throw new BadRequestException('Not blocked');
		}

		// unblock user
		await this.prismaService.blocked.delete({
			where: {
				id: entry.id,
			}
		});
	}
}