import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SignUpDto, SignInDto } from '../dto';
import * as argon2 from 'argon2';
import { Tokens } from '../types';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly tokenService: TokenService) { }

    async signupLocal(dto: SignUpDto): Promise<Tokens> {
        const hash = await this.tokenService.hashData(dto.password);
        try {
            const newUser = await this.prismaService.user.create({
                data: {
                    username: dto.username,
                    password: hash,
                    status: 'online',
                    ladder_level: 0,
                    win_count: 0,
                    loss_count: 0,
                    highest_score: 0,
                    total_points: 0,
                    avatar: 'default url',
                    visibility: 'public',
                }
            });
            const tokens = await this.tokenService.generateToken(newUser.id, newUser.username);

            await this.tokenService.updateRefreshToken(newUser.id, tokens.refreshToken);
            return tokens;
        }
        catch (error) {
            throw new ForbiddenException('Username already exists');
        }
    }

    async signinLocal(dto: SignInDto): Promise<Tokens> {
        const error_message = 'Invalid username or password';
        const user = await this.prismaService.user.findUnique({
            where: {
                username: dto.username,
            },
        });
        if (!user) {
            throw new ForbiddenException(error_message);
        }
        const isPasswordValid = await argon2.verify(user.password, dto.password);

        if (!isPasswordValid) {
            throw new ForbiddenException(error_message);
        }
        const tokens = await this.tokenService.generateToken(user.id, user.username);
        await this.tokenService.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
}
