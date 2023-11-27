import { Body, Controller, ForbiddenException, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto';
import { Tokens } from './types';
import { AuthenticationService } from './authentication/authentication.service';
import { TokenService } from './token/token.service';
import { Request, Response } from 'express';
import { IntraGuard, RtGuard, GithubGuard } from 'src/common/guards';
import { AtPublic, TwoFactorPublic } from 'src/common/Decorators';
import { AuthorizationService } from './authorization/authorization.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authenticaionService: AuthenticationService,
        private readonly tokenService: TokenService,
        private readonly authorizationService: AuthorizationService,
        private readonly prismaService: PrismaService) { }

    // * local authentication routes
    @AtPublic()
    @TwoFactorPublic()
    @Post('local/signup')
    async signupLocal(@Req() req: Request, @Body() dto: SignUpDto): Promise<Tokens> {
        return this.authenticaionService.signupLocal(dto);
    }

    @AtPublic()
    @TwoFactorPublic()
    @Post('local/signin')
    async signinLocal(@Req() req: Request, @Body() dto: SignInDto): Promise<Tokens> {
        return this.authenticaionService.signinLocal(dto);
    }

    @Get('logout')
    async logout(@Req() req: Request) {
        const user = req.user;

        return this.tokenService.logout(user['sub']);
    }

    @AtPublic()
    @TwoFactorPublic()
    @UseGuards(RtGuard)
    @Get('refresh')
    async refreshTokens(@Req() req: Request) {
        const user = req.user;

        return this.tokenService.refreshTokens(user['sub'], user['refreshToken']);
    }

    // * github open authorization routes
    @AtPublic()
    @TwoFactorPublic()
    @UseGuards(GithubGuard)
    @Get('github/login')
    async githubLogin() {

    }

    @AtPublic()
    @TwoFactorPublic()
    @UseGuards(GithubGuard)
    @Get('github/redirect')
    async githubRedirect(@Req() req: Request, @Res() res: Response) {
        const user = req.user;
        const tokens = await this.authorizationService.OAuth({ username: user['username'], avatar: user['avatar'] }, 'github');
        console.log("TOKENS : ", tokens);
        res.cookie('AccessToken', tokens.accessToken);
        res.cookie('RefreshToken', tokens.refreshToken);
        const username = user['username'] + '_github'

        const entry = await this.prismaService.user.findUnique({
            where: {
                username: username,
            },
            select: {
                nickname: true,
            },
        });

        // res.json({ status: 'hello' });
        if (entry.nickname)
            res.redirect('http://www.google.com')
        // res.redirect('http://localhost:3000/profile') // ! set redirect url in .env
        else
            res.redirect('http://www.github.com')
        // res.redirect('http://localhost:3000/complete_infos');
    }

    @AtPublic()
    @TwoFactorPublic()
    @UseGuards(IntraGuard)
    @Get('intra/login')
    async intra42Login() {
    }

    @AtPublic()
    @TwoFactorPublic()
    @UseGuards(IntraGuard)
    @Get('intra/redirect')
    async intra42Redirect(@Req() req: Request, @Res() res: Response) {
        const user = req.user;
        const tokens = await this.authorizationService.OAuth({ username: user['username'], avatar: user['avatar'] }, 'intra');

        res.cookie('AccessToken', tokens.accessToken);
        res.cookie('RefreshToken', tokens.refreshToken);

        const username = user['username'] + '_intra'

        const entry = await this.prismaService.user.findUnique({
            where: {
                username: username,
            },
            select: {
                nickname: true,
                two_factor_auth: true,
            }
        });

        if (entry.two_factor_auth === true) {
            // ! redirect to the front end 2factor page
            const entry = await this.prismaService.user.update({
                where: {
                    username: username,
                },
                data: {
                    is_two_factor_authenticated: false,
                }
            });
            return res.redirect('http://localhost:3000/2factor');
        }

        if (entry.nickname)
            res.redirect('http://www.google.com')
        // res.redirect('http://localhost:3000/profile') // ! set redirect url in .env
        else
            res.redirect('http://www.github.com')
        // res.redirect('http://localhost:3000/complete_infos');
    }

    @AtPublic()
    @TwoFactorPublic()
    @Get('JwtTokens')
    async getJwtTokens(@Req() req: Request) {
        const AccessToken = req.cookies['AccessToken'];
        const RefreshToken = req.cookies['RefreshToken'];

        if (AccessToken === undefined || RefreshToken === undefined)
            throw new ForbiddenException('Missing jwt tokens');

        return { AccessToken, RefreshToken };
    }
}
