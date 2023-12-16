import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { TokenService } from '../token/token.service';
import { AuthUser } from '../types';

@Injectable()
export class AuthorizationService {
	constructor(private readonly primsaService: PrismaService,
		private readonly tokenService: TokenService) { }

	async OAuth(authUser: AuthUser, authApi: string) {
		let sufix = '_github';
		if (authApi === 'intra') {
			sufix = '_intra';
		}
		authUser.username += sufix;

		const user = await this.tokenService.addUserToDb(authUser.username, authUser.avatar);

		const tokens = await this.tokenService.generateToken(user.id, user.username);
		await this.tokenService.updateRefreshToken(user.id, tokens.refreshToken);
		return tokens;
	}
}
