import { IsString, Matches, Length } from "class-validator";

export class TwoFactorDto {
	@IsString()
	@Length(5, 8)
	@Matches(/^[0-9]+$/, { message: 'Code should contain only digits' })
	code: string;
}
