import { IsString, IsDate, Length, Matches } from 'class-validator';

export class AdditionalInfo {
	@IsString()
	@Length(5, 20, { message: 'Username should be between 5 and 20 characters' })
	@Matches(/^[a-zA-Z0-9]+$/, { message: 'Username should contain only letters and digits' })
	nickname: string;

	@Length(5, 50)
	@IsString()
	fullname: string;

	@Matches(/^(male|female)$/)
	@IsString()
	gender: string;

	avatar: string;
}
