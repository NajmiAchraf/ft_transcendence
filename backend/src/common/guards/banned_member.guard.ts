import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GlobalHelperService } from "../services/global_helper.service";
import { PrismaService } from "src/modules/prisma/prisma.service";

@Injectable()
export class BannedMemberGuard implements CanActivate {

	constructor(private readonly globalHelperService: GlobalHelperService,
		private readonly prismaService: PrismaService) { }

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		console.log(request.body);
		if (request.user['sub'] === undefined || request.body.profileId === undefined || request.body.channelId === undefined) {
			return false;
		}

		const profileId: number = +request.body.profileId;
		const channelId = +request.body.channelId;

		const isBanned = await this.globalHelperService.isBanned(profileId, channelId);
		return !isBanned;
	}
}
