import { IsString, Matches } from "class-validator";

export class TwoFactorDto {
	@IsString()
	@Matches(/^[0-9]+$/, { message: 'Code should contain only digits' })
	code: string;
}
