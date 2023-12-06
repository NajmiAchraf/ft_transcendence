import { IsString, IsDate, Length, Matches } from 'class-validator';

export class AdditionalInfo {
	@IsString()
	@Length(5, 20, { message: 'Username should be between 5 and 20 characters' })
	@Matches(/^[a-zA-Z0-9]+$/, { message: 'Username should contain only letters and digits' })
	nickname: string;

	@IsString()
	fullname: string;

	@IsString()
	gender: string;

	avatar: string;
}
