import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GithubGuard extends AuthGuard('github') {
    async canActivate(context: ExecutionContext) {
        try {
            const activate = (await super.canActivate(context)) as boolean;

            return activate;
        }
        catch (error) {
            console.log('Hello baby!');
        }
    }
}
