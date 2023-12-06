import { authenticator } from "otplib";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { toDataURL } from 'qrcode';
import { ForbiddenException, Injectable } from "@nestjs/common";
import { GlobalHelperService } from "src/common/services/global_helper.service";

@Injectable()
export class TwoFactorService {
	constructor(private readonly prismaService: PrismaService
		, private readonly globalHelperService: GlobalHelperService) { }

	generateTwoFactorSecret(userId: number, username: string) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(username, 'Transcendence Nostalgia: The Original Experience', secret);

		return { secret, otpauthUrl };
	}

	async storeTwoFactorSecret(userId: number, secret: string) {
		const user = await this.prismaService.user.update({
			where: {
				id: userId,
			},
			data: {
				two_factor_secret: secret,
			}
		});
	}

	async getTwoFactorQr(userId: number, username: string) {
		// generate and store secret
		const { secret, otpauthUrl } = this.generateTwoFactorSecret(userId, username);

		await this.storeTwoFactorSecret(userId, secret);

		// generate QR code
		const qrCode = toDataURL(otpauthUrl);

		console.log('optauthUrl:', otpauthUrl);
		console.log('qrCode:', qrCode);
		// console.log(qrCode);
		return qrCode;
	}

	async enableTwoFactor(userId: number, code: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (this.globalHelperService.isTwoFactorCodeValid(user.two_factor_secret, code)) {
			await this.prismaService.user.update({
				where: {
					id: userId,
				},
				data: {
					two_factor_auth: true,
					is_two_factor_authenticated: true,
				}
			});
			return { status: 200, message: 'Two factor authentication enabled' };
		}
		throw new ForbiddenException('Invalid two factor code');
	}

	async checkTwoFactor(userId: number, code: string) {
		if (code === undefined) {
			throw new ForbiddenException('Two factor code not provided');
		}

		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId,
				two_factor_auth: true,
			},
		});

		if (!user) {
			throw new ForbiddenException('Two factor authentication not enabled');
		}

		if (user.is_two_factor_authenticated === true) {
			return { status: 200, message: 'User two factor already authenticated!' };
		}

		if (this.globalHelperService.isTwoFactorCodeValid(user.two_factor_secret, code)) {
			await this.prismaService.user.update({
				where: {
					id: userId,
				},
				data: {
					is_two_factor_authenticated: true,
				}
			});
			return { status: 200, message: 'User two factor authenticated!' };
		}
		throw new ForbiddenException('Invalid two factor code');
	}
}
