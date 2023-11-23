import { CanActivate, ExecutionContext, Injectable, Req } from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { Reflector } from '@nestjs/core';
import { GlobalHelperService } from "../services/global_helper.service";

@Injectable()
export class BlockCheckGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService,
		private readonly reflector: Reflector,
		private readonly globalHelper: GlobalHelperService) { }
	async canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride('isBlockPublic', [context.getHandler(), context.getClass()]);

		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();

		const userId: number = request.user['sub'];
		const profileId: number = +request.body.profileId;

		if (userId === profileId) {
			return true;
		}

		if (await this.globalHelper.isBlocked(userId, profileId)) {
			return false;
		}
		return true;
	}
}
