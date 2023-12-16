import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-42';

@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, 'intra') {
	constructor() {
		super({
			clientID: process.env.INTRA_CLIENT_ID,
			clientSecret: process.env.INTRA_CLIENT_SECRET,
			callbackURL: process.env.INTRA_CALLBACK_URL,
		});
	}
	validate(accessToken: string, refreshToken: string, profile: any) {
		const { _json } = profile;

		return { username: _json.login, avatar: _json.image.link };
	}
}
