import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class IntraGuard extends AuthGuard('intra') {
	async canActivate(context: ExecutionContext) {
		try {
			const activate = await super.canActivate(context) as boolean;

			return activate;
		}
		catch (error) {
			console.log("HELLO BABY");
		}
	}
};

