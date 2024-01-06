import { Matches, Length } from "class-validator";

export class SignInDto {
    @Matches(/^(?:(?!_42$|_github$).)*$/, { message: 'Username should not end with "_42" or "_github"' })
    @Length(5, 20)
    username: string;

    @Length(8, 20)
    password: string;
}
