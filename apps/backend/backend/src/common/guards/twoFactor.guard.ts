import { CanActivate, ExecutionContext, Injectable, Req } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { PrismaService } from "src/modules/prisma/prisma.service";

// ! not working
// ! userId in the body
@Injectable()
export class TwoFactorGuard implements CanActivate {
	prismaService: PrismaService;
	constructor(private readonly reflector: Reflector) {
		this.prismaService = new PrismaService();
	}
	async canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride('isTwoFactorPublic', [context.getHandler(), context.getClass()]);

		// if the route is set public, then let the request pass to the route handler
		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();
		const userId = request.user['sub'];
		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user)
			return false;

		if (user.two_factor_auth === true) {
			return user.is_two_factor_authenticated === true;
		}
		return true;
	}
}
