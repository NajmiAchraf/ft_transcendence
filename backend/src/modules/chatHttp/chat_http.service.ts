import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';

@Injectable()
export class ChatHttpService {
	constructor(private readonly prsimaService: PrismaService,
		private readonly globalHelperService: GlobalHelperService) { }

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

		// ! filter messages that the user is blocked by the sender or the sender is blocked by the user

		return messages;
	}
}
