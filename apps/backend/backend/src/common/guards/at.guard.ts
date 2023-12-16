import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class AtGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
    }
    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride('isAtPublic', [context.getHandler(), context.getClass()]);

        // if the route is set public, then let the request pass to the route handler
        if (isPublic) {
            return true;
        }

        // otherwise, let the AuthGuard check the request first
        return super.canActivate(context);
    }
}
