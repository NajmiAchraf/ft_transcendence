import { IsString, Length, Matches } from "class-validator";

export class SignUpDto {
  @IsString()
  @Length(5, 20, { message: 'Username should be between 5 and 20 characters' })
  @Matches(/^(?:(?!_42$|_github$).)*$/, { message: 'Username should not end with "_42" or "_github"' })
  @Matches(/^[a-zA-Z0-9]+$/, { message: 'Username should contain only letters and digits' })
  username: string;

  @IsString()
  @Length(8, undefined, { message: 'Password should be at least 8 characters long' })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).*$/, { message: 'Password should contain at least one uppercase letter, one lowercase letter, and one digit, and one special character' })
  password: string;
}
