import { CanActivate, ExecutionContext, Injectable, Req } from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { GlobalHelperService } from "../services/global_helper.service";


// ! not working
// ! userId in the body
@Injectable()
export class TwoFactorGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService,
		private readonly globalHelperService: GlobalHelperService) { }
	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest<Request>();
		const userId = +request.body.userId;
		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
		});
		if (user.two_factor_auth === true) {
			if (request.body.two_factor_code === undefined || this.globalHelperService.isTwoFactorCodeValid(user.two_factor_secret, request.body.two_factor_code) === false) {
				return false;
			}
		}
		return true;
	}
}
