import { Matches } from "class-validator";

export class SignInDto {
    @Matches(/^(?:(?!_42$|_github$).)*$/, { message: 'Username should not end with "_42" or "_github"' })
    username: string;
    password: string;
}
