import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '../types';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';

@Injectable()
export class TokenService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly globalHelperService: GlobalHelperService) { }

    async generateToken(userId: number, username: String): Promise<Tokens> {
        // generate access token and refresh token
        const [accessToken, refreshToken] = await Promise.all([
            // ! use different expiration duration
            this.jwtService.signAsync({ sub: userId, username }, { expiresIn: '1d', secret: process.env.JWT_AT_SECRET }),
            this.jwtService.signAsync({ sub: userId, username }, { expiresIn: '7d', secret: process.env.JWT_RT_SECRET }),
        ]);

        return {
            accessToken,
            refreshToken,
        }
    }

    // helper function to add a user to db
    async addUserToDb(username: string, avatar_url: string) {
        let user = await this.prismaService.user.findUnique({
            where: {
                username: username,
            }
        });

        if (!user) {
            user = await this.prismaService.user.create({
                data: {
                    username: username,
                    status: 'online',
                    level: 0,
                    level_percentage: 0,
                    win_count: 0,
                    loss_count: 0,
                    highest_score: 0,
                    total_points: 0,
                    avatar: avatar_url,
                    visibility: 'public',
                }
            });
        }
        return user;
    }

    // helper function to store refresh token in db
    async updateRefreshToken(userId: number, rt: string) {
        const hash = await this.globalHelperService.hashData(rt);
        await this.prismaService.user.update({
            where: {
                id: userId,
            },
            data: {
                refresh_token: hash,
            },
        })
    }

    async logout(userId: number) {
        await this.prismaService.user.updateMany({
            where: {
                id: userId,
                refresh_token: {
                    not: null,
                },
            },
            data: {
                refresh_token: null,
                is_two_factor_authenticated: false,
            },
        });
        console.log('logged out');
    }

    async refreshTokens(userId: number, refreshToken: string) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
        });
        console.log('user : ', user);
        console.log('refreshToken : ', refreshToken);
        if (!user || !user.refresh_token) {
            throw new ForbiddenException('Access Denied');
        }

        const isRefreshTokenValid = await this.globalHelperService.verifyHash(user.refresh_token, refreshToken);

        if (!isRefreshTokenValid) {
            throw new ForbiddenException('Invalid refresh token');
        }
        const tokens = await this.generateToken(user.id, user.username);
        this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
}
