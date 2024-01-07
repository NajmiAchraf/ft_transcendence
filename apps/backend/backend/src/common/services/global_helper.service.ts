import { Injectable } from "@nestjs/common";
import { authenticator } from "otplib";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { Socket } from "socket.io";
import * as jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';

@Injectable()
export class GlobalHelperService {
	constructor(private readonly prismaService: PrismaService) { }

	async isBlocked(checkedId: number, blockingId: number): Promise<boolean> {
		// console.log(`checkedId: ${checkedId}, blockingId: ${blockingId}`);
		// checking if user is blocked
		const entry = await this.prismaService.blocked.findFirst({
			where: {
				blocking_user_id: blockingId,
				blocked_user_id: checkedId,
			}
		});
		return entry !== null;
	}

	async isBanned(userId: number, channelId: number): Promise<boolean> {
		// checking if user is banned from channel
		const entry = await this.prismaService.banned.findFirst({
			where: {
				channel_id: channelId,
				banned_user_id: userId,
			}
		});
		return entry !== null;
	}

	async areFriends(user1_id: number, user2_id: number): Promise<boolean> {
		// checking if users are friends
		const entry = await this.prismaService.friends.findFirst({
			where: {
				OR: [{
					user1_id: user1_id,
					user2_id: user2_id,
				}, {
					user1_id: user2_id,
					user2_id: user1_id,
				}],
			}
		});
		return entry !== null;
	}

	isTwoFactorCodeValid(secret: string, code: string): boolean {
		return authenticator.verify({ token: code, secret });
	}

	async getClientIdFromJwt(client: Socket): Promise<number | undefined> {
		const token: string = client.handshake.query['accessToken'] as string;
		let payload;

		try {
			payload = await jwt.verify(token, process.env.JWT_AT_SECRET);

			const entry = await this.prismaService.user.findUnique({
				where: {
					id: payload['sub'],
					refresh_token: {
						not: null,
					},
				}
			});

			if (!entry) {
				return undefined;
			}
			return payload['sub'];
		} catch (err) {
			console.log('Jwt Verification failed');
			return undefined;
		}
	}

	// helper function to hash data
	async hashData(data: string) {
		return argon2.hash(data);
	}

	async verifyHash(hash: string, data: string) {
		if (hash === undefined || data === undefined) {
			return false;
		}
		return argon2.verify(hash, data);
	}

	join(host: string, path: string) {
		return `${host}/${path}`;
	}

}
