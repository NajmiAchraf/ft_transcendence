import { CanActivate, ExecutionContext, Injectable, Req } from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { Reflector } from '@nestjs/core';

@Injectable()
export class VisibilityCheckGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService,
		private readonly reflector: Reflector) { }
	async canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride('isFriendPublic', [context.getHandler(), context.getClass()]);

		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();

		const userId: number = request.user['sub'];
		const profileId: number = +request.body.profileId;

		if (userId === profileId) {
			return true;
		}

		// check if the profile is public
		const user = await this.prismaService.user.findUnique({
			where: {
				id: profileId,
			},
			select: {
				visibility: true,
			}
		});

		// if public, let the request pass
		if (user.visibility === 'public') {
			return true;
		}

		// if private, check wheather they are friends
		const entry = await this.prismaService.friends.findFirst({
			where: {
				OR: [{
					user1_id: userId,
					user2_id: profileId,
				}, {
					user1_id: profileId,
					user2_id: userId,
				}],
			}
		});

		// if they are friends, let the request pass
		return entry !== null;
	}
}
