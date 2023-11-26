import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { PrismaService } from "src/modules/prisma/prisma.service";

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly prismaService: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_AT_SECRET,
        });

    }
    async validate(payload: any) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: payload.sub,
                refresh_token: {
                    not: null,
                }
            }
        });

        if (!user)
            return null;

        return payload;
    }
}
