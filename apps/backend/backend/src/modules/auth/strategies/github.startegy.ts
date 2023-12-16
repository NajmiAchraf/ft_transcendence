import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-github";
import { TokenService } from "../token/token.service";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(private readonly tokenService: TokenService) {
        super({
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL,
            scope: ['user:email'],
        })
    }

    async validate(accessToken: string, refreshToken, profile: Profile) {
        const { username, photos } = profile;

        return { username, avatar: photos[0].value }
    }
}
