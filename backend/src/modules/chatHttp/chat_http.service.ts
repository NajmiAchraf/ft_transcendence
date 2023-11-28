import { ForbiddenException, Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';
import { ChatBlockCheckGuard } from 'src/common/guards';
import { CreateChannelDto } from './dto';

@Injectable()
export class ChatHttpService {
	constructor(private readonly prsimaService: PrismaService,
		private readonly globalHelperService: GlobalHelperService) { }

	@UseGuards(ChatBlockCheckGuard)
	async getLastDM(userId: number, profileId: number) {
		const dm = await this.prsimaService.direct_message.findMany({
			where: {
				OR: [
					{ sender_id: userId, receiver_id: profileId },
					{ sender_id: profileId, receiver_id: userId }
				]
			},
			orderBy: {
				created_at: 'desc',
			},
			take: 1,
		})
		return dm;
	}

	@UseGuards(ChatBlockCheckGuard)
	async getDMHistory(userId: number, profileId: number) {
		const dm = await this.prsimaService.direct_message.findMany({
			where: {
				OR: [
					{ sender_id: userId, receiver_id: profileId },
					{ sender_id: profileId, receiver_id: userId }
				]
			},
			orderBy: {
				created_at: 'desc',
			},
		})
		return dm;
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
				messageId: entry.id,
				senderId: entry.sender_id,
				senderNickname: entry.globalm_sender.nickname,
				message: entry.message_text,
				createdAt: entry.created_at,
			}
		});

		// filter messages that the user is blocked by the sender or the sender is blocked by the user
		const filteredMessagesPromises = messages.filter(async (message) => {
			return !(await this.globalHelperService.isBlocked(userId, message.senderId) || await this.globalHelperService.isBlocked(message.senderId, userId));
		});

		return await Promise.all(filteredMessagesPromises);
	}

	async createChannel(body: CreateChannelDto, userId: number) {
		if (body.privacy !== 'private' && body.privacy !== 'public' && body.privacy !== 'protected') {
			throw new Error('Invalid privacy');
		}

		if (body.privacy === 'protected' && body.password !== undefined) {
			throw new Error('Password must be provided for protected channels');
		}

		try {
			const channel = await this.prsimaService.channel.create({
				data: {
					channel_name: body.channelName,
					avatar: body.avatar,
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
			return { error: 'Channel name already exists' };
		}
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

		// check if the channel is not protected
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
		if (addedEntry.user_role === 'admin') {
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

		// check if the channel is protected
		const channel = await this.prsimaService.channel.findUnique({
			where: {
				id: channelId,
			},
			select: {
				privacy: true,
				password: true,
			}
		});

		if (channel.privacy === 'protected' && !await this.globalHelperService.verifyHash(channel.password, password)) {
			throw new ForbiddenException('Invalid password');
		}
	}
}
