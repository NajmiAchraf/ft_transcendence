import { IsString, IsDate, Length, Matches } from 'class-validator';

export class SettingsDto {
	@IsString()
	@Length(5, 20, { message: 'Username should be between 5 and 20 characters' })
	@Matches(/^[a-zA-Z0-9]+$/, { message: 'Username should contain only letters and digits' })
	nickname: string;

	@IsString()
	@Length(5, 10, { message: 'privacy should be less than 10' })
	@Matches(/^(private|public)$/, {
		message: 'Privacy should be either "private" or "public"',
	})
	privacy: string;

	avatar: string;
}
