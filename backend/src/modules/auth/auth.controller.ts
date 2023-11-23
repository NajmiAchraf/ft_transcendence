import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto';
import { Tokens } from './types';
import { AuthenticationService } from './authentication/authentication.service';
import { TokenService } from './token/token.service';
import { Request } from 'express';
import { IntraGuard, RtGuard, GithubGuard } from 'src/common/guards';
import { AtPublic } from 'src/common/Decorators';
import { AuthorizationService } from './authorization/authorization.service';
import { TwoFactorGuard } from 'src/common/guards/twoFactor.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authenticaionService: AuthenticationService,
        private readonly tokenService: TokenService,
        private readonly authorizationService: AuthorizationService) { }

    // * local authentication routes
    @AtPublic()
    @Post('local/signup')
    async signupLocal(@Body() dto: SignUpDto): Promise<Tokens> {
        return this.authenticaionService.signupLocal(dto);
    }

    @AtPublic()
    // @UseGuards(TwoFactorGuard)
    @Post('local/signin')
    async signinLocal(@Body() dto: SignInDto): Promise<Tokens> {
        return this.authenticaionService.signinLocal(dto);
    }

    // ? jwt routes
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
    async githubRedirect(@Req() req: Request) {
        const user = req.user;
        return this.authorizationService.OAuth({ username: user['username'], avatar: user['avatar'] }, 'github');
    }

    // * intra42 open authorization routes
    @AtPublic()
    @UseGuards(IntraGuard)
    @Get('intra/login')
    async intra42Login() {
    }

    @AtPublic()
    @UseGuards(IntraGuard)
    @UseGuards(TwoFactorGuard)
    @Get('intra/redirect')
    async intra42Redirect(@Req() req: Request) {
        const user = req.user;
        return this.authorizationService.OAuth({ username: user['username'], avatar: user['avatar'] }, 'intra');
    }
}
