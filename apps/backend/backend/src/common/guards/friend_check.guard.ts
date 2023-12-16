import { CanActivate, ExecutionContext, Injectable, Req } from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { Reflector } from '@nestjs/core';
import { GlobalHelperService } from "../services/global_helper.service";

@Injectable()
export class FriendCheckGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService,
		private readonly reflector: Reflector,
		private readonly globalHelperService: GlobalHelperService) { }
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

		return await this.globalHelperService.areFriends(userId, profileId);
	}
}
