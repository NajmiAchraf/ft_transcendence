import { Body, Controller, ForbiddenException, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto';
import { Tokens } from './types';
import { AuthenticationService } from './authentication/authentication.service';
import { TokenService } from './token/token.service';
import { Request, Response } from 'express';
import { IntraGuard, RtGuard, GithubGuard } from 'src/common/guards';
import { AtPublic } from 'src/common/Decorators';
import { AuthorizationService } from './authorization/authorization.service';
import { TwoFactorGuard } from 'src/common/guards/twoFactor.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authenticaionService: AuthenticationService,
        private readonly tokenService: TokenService,
        private readonly authorizationService: AuthorizationService,
        private readonly prismaService: PrismaService) { }

    // * local authentication routes
    @AtPublic()
    @Post('local/signup')
    async signupLocal(@Req() req: Request, @Body() dto: SignUpDto): Promise<Tokens> {
        return this.authenticaionService.signupLocal(dto);
    }

    @AtPublic()
    // @UseGuards(TwoFactorGuard)
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
    @UseGuards(RtGuard)
    @Get('refresh')
    async refreshTokens(@Req() req: Request) {
        const user = req.user;

        return this.tokenService.refreshTokens(user['sub'], user['refreshToken']);
    }

    // * github open authorization routes
    @AtPublic()
    @UseGuards(GithubGuard)
    @Get('github/login')
    async githubLogin() {

    }

    @AtPublic()
    @UseGuards(GithubGuard)
    @UseGuards(TwoFactorGuard)
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
    @UseGuards(IntraGuard)
    @Get('intra/login')
    async intra42Login() {
    }

    @AtPublic()
    @UseGuards(IntraGuard)
    // @UseGuards(TwoFactorGuard)
    @Get('intra/redirect')
    async intra42Redirect(@Req() req: Request, @Res() res: Response) {
        const user = req.user;
        const tokens = await this.authorizationService.OAuth({ username: user['username'], avatar: user['avatar'] }, 'intra');
        console.log("TOKENS : ", tokens);
        res.cookie('AccessToken', tokens.accessToken);
        res.cookie('RefreshToken', tokens.refreshToken);
        const username = user['username'] + '_intra'

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
    @Get('JwtTokens')
    async getJwtTokens(@Req() req: Request) {
        const AccessToken = req.cookies['AccessToken'];
        const RefreshToken = req.cookies['RefreshToken'];

        if (AccessToken === undefined || RefreshToken === undefined)
            throw new ForbiddenException('Missing jwt tokens');

        return { AccessToken, RefreshToken };
    }
}
