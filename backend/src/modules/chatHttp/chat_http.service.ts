import { ForbiddenException, Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';
import { CreateChannelDto } from './dto';

@Injectable()
export class ChatHttpService {
	constructor(private readonly prsimaService: PrismaService,
		private readonly globalHelperService: GlobalHelperService) { }

	async getLastDMs(userId: number) {
		const receiverIds = await this.prsimaService.direct_message.findMany({
			where: {
				sender_id: userId,
			},
		});

		const senderIds = await this.prsimaService.direct_message.findMany({
			where: {
				receiver_id: userId,
			},
		})

		if (senderIds.length === 0 && receiverIds.length === 0) {
			return [];
		}

		const filteredIds = [...new Set([...receiverIds.map(entry => entry.receiver_id), ...senderIds.map(entry => entry.sender_id)])];

		// get the last message for each user
		const lastDms = await Promise.all(filteredIds.map(async (id) => {
			const entry = await this.prsimaService.direct_message.findMany({
				where: {
					sender_id: userId,
					receiver_id: id,
				},
				orderBy: {
					created_at: 'desc',
				},
				take: 1,
				include: {
					dm_receiver: true,
				},
			});

			const entry2 = await this.prsimaService.direct_message.findMany({
				where: {
					sender_id: id,
					receiver_id: userId,
				},
				orderBy: {
					created_at: 'desc',
				},
				take: 1,
				include: {
					dm_sender: true,
				},
			});

			if (entry.length !== 0 && (entry2.length == 0 || entry[0].created_at > entry2[0].created_at)) {
				return {
					profileId: entry[0].receiver_id,
					nickname: entry[0].dm_receiver.nickname,
					avatar: entry[0].dm_receiver.avatar,
					status: entry[0].dm_receiver.status,
					message_text: entry[0].message_text,
					created_at: entry[0].created_at,
					isSender: true,
				};
			} else {
				return {
					profileId: entry2[0].sender_id,
					nickname: entry2[0].dm_sender.nickname,
					avatar: entry2[0].dm_sender.avatar,
					status: entry2[0].dm_sender.status,
					message_text: entry2[0].message_text,
					created_at: entry2[0].created_at,
					isSender: false,
				};
			}
		}));

		// sort by created_at

		lastDms.sort((a, b) => {
			return b.created_at.getTime() - a.created_at.getTime();
		});
		return lastDms;
	}

	async getChannelMembers(userId: number, channelId: number) {
		const entry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: userId,
			},
		});

		if (!entry) {
			throw new ForbiddenException('You are not in the channel');
		}

		const entries = await this.prsimaService.user_channel.findMany({
			where: {
				channel_id: channelId,
			},
			include: {
				channel_member: true,
			}
		});

		const owner = {};
		const admins = [];
		const members = [];

		const user_role = entry.user_role;
		entries.forEach(entry => {
			if (entry.user_role === 'owner') {
				owner['id'] = entry.channel_member.id;
				owner['nickname'] = entry.channel_member.nickname;
				owner['avatar'] = entry.channel_member.avatar;
				owner['status'] = entry.channel_member.status;
				owner['operate'] = false;
				owner['isSelf'] = entry.channel_member.id === userId;
				return;
			}
			if (entry.user_role === 'admin') {
				admins.push({
					id: entry.channel_member.id,
					nickname: entry.channel_member.nickname,
					avatar: entry.channel_member.avatar,
					status: entry.channel_member.status,
					operate: user_role === 'owner',
					isSelf: entry.channel_member.id === userId,
				});
				return;
			}
			members.push({
				id: entry.channel_member.id,
				nickname: entry.channel_member.nickname,
				avatar: entry.channel_member.avatar,
				status: entry.channel_member.status,
				operate: user_role === 'owner' || user_role === 'admin',
				isSelf: entry.channel_member.id === userId,
			});
		});

		return {
			owner,
			admins,
			members,
		}
	}

	async getDmFriend(userId: number, profileId: number) {
		const profile = await this.prsimaService.user.findUnique({
			where: {
				id: profileId,
			}
		});

		const user = await this.prsimaService.user.findUnique({
			where: {
				id: userId,
			}
		});

		return [
			{
				id: profile.id,
				nickname: profile.nickname,
				avatar: profile.avatar,
				status: profile.status,
			},
			{
				id: user.id,
				nickname: user.nickname,
				avatar: user.avatar,
				status: user.status,
			},
		]
	}

	async getLastChannelMessages(userId: number) {
		const entries = await this.prsimaService.user_channel.findMany({
			where: {
				user_id: userId,
			},
			include: {
				channel: true,
			}
		});

		const filteredEntries = await Promise.all(entries.map(async entry => {
			const last_message = await this.prsimaService.channels_message.findMany({
				where: {
					channel_id: entry.channel_id,
				},
				orderBy: {
					created_at: 'desc',
				},
				include: {
					cm_sender: true,
				},
				take: 1,
			});

			return {
				channel_id: entry.channel_id,
				channel_name: entry.channel.channel_name,
				avatar: entry.channel.avatar,
				last_message: last_message.length !== 0 ? last_message[0].message_text : null,
				sender_id: last_message.length !== 0 ? last_message[0].sender_id : null,
				nickname: last_message.length !== 0 ? last_message[0].cm_sender.nickname : null,
				created_at: last_message.length !== 0 ? last_message[0].created_at : null,
			}
		})
		);

		filteredEntries.sort((a, b) => {
			return b.created_at.getTime() - a.created_at.getTime();
		});

		return filteredEntries;
	}

	async getChannelMessageHistory(channelId: number, userId: number) {
		const entry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: userId,
			},
		});

		if (!entry) {
			throw new ForbiddenException('You are not in the channel');
		}

		const entries = await this.prsimaService.channels_message.findMany({
			where: {
				channel_id: channelId,
			},
			orderBy: {
				created_at: 'desc',
			},
			include: {
				cm_sender: true,
			},
		});

		const filteredEntries = await Promise.all(entries.filter(async entry => {
			if (entry.sender_id === userId || (!await this.globalHelperService.isBlocked(userId, entry.sender_id) && !await this.globalHelperService.isBlocked(entry.sender_id, userId))) {
				return true;
			}
			return false;
		}));

		const messages = filteredEntries.map(entry => {
			return {
				sender_id: entry.sender_id,
				nickname: entry.cm_sender.nickname,
				message_text: entry.message_text,
				avatar: entry.cm_sender.avatar,
				status: entry.cm_sender.status,
				created_at: entry.created_at,
			}
		});

		return messages;
	}

	async amIOwner(userId: number, channelId: number) {
		const entry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: userId,
			},
		});

		if (!entry) {
			throw new ForbiddenException('You are not in the channel');
		}

		return entry.user_role === 'owner';
	}

	async inviteToChannelList(userId: number, channelId: number) {
		const entry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: userId,
			},
		});

		if (!entry) {
			throw new ForbiddenException('You are not in the channel');
		}

		const entries = await this.prsimaService.friends.findMany({
			where: {
				OR: [{ user1_id: userId }, { user2_id: userId }],
			},
			include: {
				user1: true,
				user2: true,
			}
		});

		const filteredFriends = [];

		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];
			const friendId = entry.user1_id === userId ? entry.user2_id : entry.user1_id;

			const memberEntry = await this.prsimaService.user_channel.findFirst({
				where: {
					channel_id: channelId,
					user_id: friendId,
				},
			});

			const banEntry = await this.prsimaService.banned.findFirst({
				where: {
					channel_id: channelId,
					banned_user_id: friendId,
				},
			});

			if (!memberEntry && !banEntry) {
				filteredFriends.push(entry);
			}
		}

		const inviteList = filteredFriends.map(entry => {
			const friend = entry.user1_id === userId ? entry.user2 : entry.user1;

			return {
				id: friend.id,
				nickname: friend.nickname,
				avatar: friend.avatar,
				status: friend.status,
			}
		});

		return inviteList;
	}

	async getDMHistory(userId: number, profileId: number) {
		const dms = await this.prsimaService.direct_message.findMany({
			where: {
				OR: [
					{ sender_id: userId, receiver_id: profileId },
					{ sender_id: profileId, receiver_id: userId }
				]
			},
			orderBy: {
				created_at: 'desc',
			},
			include: {
				dm_sender: true,
			}
		})

		return dms.map(dm => {
			return {
				id: dm.sender_id,
				nickname: dm.dm_sender.nickname,
				avatar: dm.dm_sender.avatar,
				status: dm.dm_sender.status,
				message_text: dm.message_text,
				created_at: dm.created_at,
			}
		});
	}

	async findAllGlobalChat(userId: number) {
		const entries = await this.prsimaService.global_chat.findMany({
			include: {
				globalm_sender: true,
			},
			orderBy: {
				created_at: 'desc',
			},
		});

		const messages = entries.map(entry => {
			return {
				sender_id: entry.sender_id,
				nickname: entry.globalm_sender.nickname,
				message_text: entry.message_text,
				avatar: entry.globalm_sender.avatar,
				status: entry.globalm_sender.status,
				created_at: entry.created_at,
			}
		});

		// filter messages that the user is blocked by the sender or the sender is blocked by the user
		const filteredMessagesPromises = messages.filter(async (message) => {
			return !(await this.globalHelperService.isBlocked(userId, message.sender_id) || await this.globalHelperService.isBlocked(message.sender_id, userId));
		});

		return await Promise.all(filteredMessagesPromises);
	}

	async findChannelChat(userId: number, channelId: number) {
		const entry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: userId,
			},
		});

		if (!entry) {
			throw new ForbiddenException('You are not in the channel');
		}

		const entries = await this.prsimaService.channels_message.findMany({
			where: {
				channel_id: channelId,
			},
			include: {
				cm_sender: true,
			},
			orderBy: {
				created_at: 'desc',
			},
		});

		const messages = entries.map(entry => {
			return {
				sender_id: entry.sender_id,
				nickname: entry.cm_sender.nickname,
				message_text: entry.message_text,
				avatar: entry.cm_sender.avatar,
				status: entry.cm_sender.status,
				created_at: entry.created_at,
			}
		});

		// filter messages that the user is blocked by the sender or the sender is blocked by the user
		const filteredMessagesPromises = messages.filter(async (message) => {
			return !(await this.globalHelperService.isBlocked(userId, message.sender_id) || await this.globalHelperService.isBlocked(message.sender_id, userId));
		});

		return await Promise.all(filteredMessagesPromises);
	}

	async createChannel(body: CreateChannelDto, userId: number) {
		if (body.privacy !== 'private' && body.privacy !== 'public' && body.privacy !== 'protected') {
			throw new ForbiddenException('Invalid privacy');
		}

		if (body.privacy === 'protected' && body.password === undefined) {
			throw new ForbiddenException('Password must be provided for protected channels');
		}

		try {
			const channel = await this.prsimaService.channel.create({
				data: {
					channel_name: body.channelName,
					avatar: this.globalHelperService.join(process.env.API_URL, body.avatar),
					privacy: body.privacy,
					members_count: 1,
				}
			});

			if (body.privacy === 'protected') {
				const hash = await this.globalHelperService.hashData(body.password);

				await this.prsimaService.channel.update({
					where: {
						id: channel.id,
					},
					data: {
						password: hash,
					}
				});
			}

			await this.prsimaService.user_channel.create({
				data: {
					user_role: 'owner',
					channel_id: channel.id,
					user_id: userId,
				}
			});
		} catch (error) {
			throw new ForbiddenException('Channel name already exists');
		}
	}

	async changeChannelPassword(userId: number, channelId: number, password: string | undefined) {
		if (password === undefined) {
			throw new ForbiddenException('Password must be provided');
		}

		// check if the user is the owner
		const entry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: userId,
			},
		});

		if (!entry) {
			throw new ForbiddenException('You are not in the channel');
		}

		if (entry.user_role !== 'owner') {
			throw new ForbiddenException('Only owners can change the password');
		}

		const channelEntry = await this.prsimaService.channel.findUnique({
			where: {
				id: channelId,
			},
			select: {
				privacy: true,
			}
		});

		if (channelEntry.privacy !== 'protected') {
			throw new ForbiddenException('Only protected channels have passwords');
		}

		const hash = await this.globalHelperService.hashData(password);

		await this.prsimaService.channel.update({
			where: {
				id: channelId,
			},
			data: {
				password: hash,
			}
		});
	}

	async removeChannelPassword(userId: number, channelId: number) {
		// check if the user is the owner
		const entry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: userId,
			},
		});

		if (!entry) {
			throw new ForbiddenException('You are not in the channel');
		}

		if (entry.user_role !== 'owner') {
			throw new ForbiddenException('Only owners can remove the password');
		}

		const channelEntry = await this.prsimaService.channel.findUnique({
			where: {
				id: channelId,
			},
			select: {
				privacy: true,
			}
		});

		if (channelEntry.privacy !== 'protected') {
			throw new ForbiddenException('Only protected channels have passwords');
		}

		await this.prsimaService.channel.update({
			where: {
				id: channelId,
			},
			data: {
				privacy: 'public',
			}
		});
	}

	async addChannelMember(userId: number, channelId: number, memberId: number) {
		if (userId === memberId) {
			throw new ForbiddenException('You cannot add yourself to a channel');
		}

		// check if the adder is in the channel
		const adderEntry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: userId,
			},
		});

		if (!adderEntry) {
			throw new ForbiddenException('You are not in the channel');
		}

		// check if the channel is protected
		const channel = await this.prsimaService.channel.findUnique({
			where: {
				id: channelId,
			},
			select: {
				privacy: true,
			}
		});

		if (channel.privacy === 'protected') {
			throw new ForbiddenException('Channel is protected');
		}

		// check if they are friends
		if (!await this.globalHelperService.areFriends(userId, memberId)) {
			throw new ForbiddenException('Only friends can be added to channels');
		}

		// check if user is already in the channel
		const addedEntry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: memberId,
			},
		});

		if (addedEntry) {
			throw new ForbiddenException('User is already in the channel');
		}

		// add user to channel
		await this.prsimaService.user_channel.create({
			data: {
				user_role: 'member',
				channel_id: channelId,
				user_id: memberId,
			}
		});

		// * increment members_count
		await this.prsimaService.channel.update({
			where: {
				id: channelId,
			},
			data: {
				members_count: {
					increment: 1,
				}
			}
		});
	}

	async addChannelAdmin(userId: number, channelId: number, memberId: number) {
		if (userId === memberId) {
			throw new ForbiddenException('You cannot add yourself to a channel');
		}

		// check if the adder is in the channel
		const adderEntry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: userId,
			},
		});

		if (!adderEntry) {
			throw new ForbiddenException('You are not in the channel');
		}

		// check if the adder is admin or owner
		if (adderEntry.user_role !== 'admin' && adderEntry.user_role !== 'owner') {
			throw new ForbiddenException('Only admins and owners can add admins');
		}

		// check if user is already in the channel
		const addedEntry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: memberId,
			},
		});

		if (!addedEntry) {
			throw new ForbiddenException('User is not in the channel');
		}

		// check if user is already an admin
		if (addedEntry.user_role === 'admin' || addedEntry.user_role === 'owner') {
			throw new ForbiddenException('User is already an admin');
		}

		// update user role to admin
		await this.prsimaService.user_channel.update({
			where: {
				id: addedEntry.id,
			},
			data: {
				user_role: 'admin',
			}
		});
	}

	async joinChannel(userId: number, channelId: number, password: string | undefined) {
		// check if the user is already in the channel
		const entry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: userId,
			},
		});

		if (entry) {
			throw new ForbiddenException('You are already in the channel');
		}

		const channel = await this.prsimaService.channel.findUnique({
			where: {
				id: channelId,
			},
			select: {
				privacy: true,
				password: true,
			}
		});

		if (!channel) {
			throw new ForbiddenException('channel does not exist');
		}

		// you can join a private channel only if you are invited
		if (channel.privacy === 'private') {
			throw new ForbiddenException('Channel is private');
		}
		// check if the channel is protected and if the password is correct
		if (channel.privacy === 'protected' && !await this.globalHelperService.verifyHash(channel.password, password)) {
			throw new ForbiddenException('Invalid password');
		}

		// add user to channel
		await this.prsimaService.user_channel.create({
			data: {
				user_role: 'member',
				channel_id: channelId,
				user_id: userId,
			}
		});

		// * increment members_count
		await this.prsimaService.channel.update({
			where: {
				id: channelId,
			},
			data: {
				members_count: {
					increment: 1,
				}
			}
		});
	}

	async leaveChannel(userId: number, channelId: number) {
		// check if the user is in the channel
		const entry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: userId,
			},
		});

		if (!entry) {
			throw new ForbiddenException('You are not in the channel');
		}

		const entries = await this.prsimaService.user_channel.findMany({});

		if (entries.length > 1) {
			// check if the user is the owner
			if (entry.user_role === 'owner') {
				const [admin] = await this.prsimaService.user_channel.findMany({
					where: {
						channel_id: channelId,
						user_role: 'admin',
					},
					take: 1,
					orderBy: {
						created_at: 'asc',
					}
				});

				if (!admin) {
					throw new ForbiddenException('No admin replace the owner');
				}

				// set the first admin as the owner
				await this.prsimaService.user_channel.update({
					where: {
						id: admin.id,
					},
					data: {
						user_role: 'owner',
					}
				});
			}
		}

		// delete user from channel
		await this.prsimaService.user_channel.delete({
			where: {
				id: entry.id,
			}
		});

		// * decrement members_count
		await this.prsimaService.channel.update({
			where: {
				id: channelId,
			},
			data: {
				members_count: {
					decrement: 1,
				}
			}
		});

		if (entries.length === 1) {
			// delete channel
			await this.prsimaService.channel.delete({
				where: {
					id: channelId,
				}
			});
		}
	}

	async kickChannelMember(userId: number, channelId: number, memberId: number) {
		if (userId === memberId) {
			throw new ForbiddenException('You cannot kick yourself');
		}

		const kickerEntry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: userId,
			},
		});

		if (!kickerEntry) {
			throw new ForbiddenException('You are not in the channel');
		}

		if (kickerEntry.user_role !== 'owner' && kickerEntry.user_role !== 'admin') {
			throw new ForbiddenException('Only admins and owners can kick members');
		}

		const kickedEntry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: memberId,
			},
		});

		if (!kickedEntry) {
			throw new ForbiddenException('User is not in the channel');
		}

		if (kickedEntry.user_role === 'owner') {
			throw new ForbiddenException('You cannot kick the owner');
		}

		if (kickerEntry.user_role !== 'owner' && kickedEntry.user_role === 'admin') {
			throw new ForbiddenException('Only owners can kick admins');
		}

		await this.prsimaService.user_channel.delete({
			where: {
				id: kickedEntry.id,
			}
		});

		// * decrement members_count
		await this.prsimaService.channel.update({
			where: {
				id: channelId,
			},
			data: {
				members_count: {
					decrement: 1,
				}
			}
		});
	}

	async banChannelMember(userId: number, channelId: number, memberId: number) {
		try {
			await this.kickChannelMember(userId, channelId, memberId);

			await this.prsimaService.banned.create({
				data: {
					channel_id: channelId,
					banned_user_id: memberId,
				}
			});
		} catch (error) {
			throw new ForbiddenException('Invalid ban');
		}
	}

	async muteChannelMember(userId: number, channelId: number, memberId: number) {
		const muterEntry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: userId,
			},
		});

		if (!muterEntry) {
			throw new ForbiddenException('You are not in the channel');
		}

		if (muterEntry.user_role !== 'owner' && muterEntry.user_role !== 'admin') {
			throw new ForbiddenException('Only admins and owners can mute members');
		}

		const mutedEntry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: memberId,
			},
		});

		if (!mutedEntry) {
			throw new ForbiddenException('User is not in the channel');
		}

		if (mutedEntry.user_role === 'owner') {
			throw new ForbiddenException('You cannot mute the owner');
		}

		if (muterEntry.user_role !== 'owner' && mutedEntry.user_role === 'admin') {
			throw new ForbiddenException('Only owners can mute admins');
		}

		await this.prsimaService.muted.create({
			data: {
				channel_id: channelId,
				muted_user_id: memberId,
			}
		});
	}

	async createChannelMessage(userId: number, channelId: number, message: string) {
		const entry = await this.prsimaService.user_channel.findFirst({
			where: {
				channel_id: channelId,
				user_id: userId,
			},
		});

		if (!entry) {
			throw new ForbiddenException('You are not in the channel');
		}

		// check if the user is muted
		const BanEntry = await this.prsimaService.muted.findFirst({
			where: {
				channel_id: channelId,
				muted_user_id: userId,
			},
		});

		if (BanEntry) {
			if (Date.now() - BanEntry.created_at.getTime() < 1000 * 60 * 2) {
				throw new ForbiddenException('You are muted');
			}
			// delete the banned entry
			await this.prsimaService.muted.delete({
				where: {
					id: BanEntry.id,
				},
			});
		}

		// created the message
		await this.prsimaService.channels_message.create({
			data: {
				message_text: message,
				sender_id: userId,
				channel_id: channelId,
			}
		});
	}

	async createDM(userId: number, receiverId: number, message: string) {
		// check if the users are friends
		if (!await this.globalHelperService.areFriends(userId, receiverId)) {
			throw new ForbiddenException('You can only send messages to friends');
		}

		// create the message
		await this.prsimaService.direct_message.create({
			data: {
				message_text: message,
				sender_id: userId,
				receiver_id: receiverId,
			}
		});
	}

	async findOtherChannels(userId: number) {
		const entries = await this.prsimaService.user_channel.findMany({
			where: {
				user_id: userId,
			},
			select: {
				channel_id: true,
			}
		});

		const channelIds = entries.map(entry => entry.channel_id);

		const channels = await this.prsimaService.channel.findMany({
			where: {
				id: {
					notIn: channelIds,
				},
				privacy: 'public',
			},
			orderBy: {
				members_count: 'desc',
			},
		});

		return channels;
	}
}
