import { CanActivate, ExecutionContext, Injectable, Req } from "@nestjs/common";
import { Request } from "express";
import { Reflector } from '@nestjs/core';
import { GlobalHelperService } from "../services/global_helper.service";

@Injectable()
export class ChatBlockCheckGuard implements CanActivate {
	constructor(private readonly reflector: Reflector,
		private readonly globalHelper: GlobalHelperService) { }
	async canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride('isBlockPublic', [context.getHandler(), context.getClass()]);

		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();

		const userId: number = request.user['sub'];
		const profileId: number = +request.body.profileId;

		if (userId === undefined || profileId === undefined) {
			return false;
		}

		if (userId === profileId) {
			return true;
		}

		if (await this.globalHelper.isBlocked(userId, profileId)
			|| await this.globalHelper.isBlocked(profileId, userId)) {
			return false;
		}
		return true;
	}
}
