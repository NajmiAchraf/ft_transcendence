import { GlobalHelperService } from "src/common/services/global_helper.service";
import { PrismaService } from "../prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserHelperService {
	constructor(private readonly prismaService: PrismaService,
		private readonly globalHelperService: GlobalHelperService) { }

	async isMemberOfChannel(channel: any, userId: number, profileId: number) {
		if (userId === profileId) {
			return true;
		}
		const entry = await this.prismaService.user_channel.findFirst({
			where: {
				channel_id: channel.id,
				user_id: userId,
			}
		});
		return entry !== null;
	}

	async isChannelVisible(channel: any, userId: number, profileId: number) {
		// checking if user is banned from channel
		if (await this.globalHelperService.isBanned(userId, channel.id)) {
			return false;
		}

		// checking channel visibility
		if (userId === profileId || channel.privacy !== 'private') {
			return true;
		}
		if (channel.isJoined) {
			return true;
		}
		return false;
	}

}