import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GlobalHelperService } from "../services/global_helper.service";
import { PrismaService } from "src/modules/prisma/prisma.service";

@Injectable()
export class BannedUserGuard implements CanActivate {

	constructor(private readonly globalHelperService: GlobalHelperService,
		private readonly prismaService: PrismaService) { }

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		console.log(request.body);
		if (request.user['sub'] === undefined || request.body['channelId'] === undefined) {
			return false;
		}

		const userId: number = request.user['sub'];
		const channelId = +request.body.channelId;

		const isBanned = await this.globalHelperService.isBanned(userId, channelId);
		return !isBanned;
	}
}
