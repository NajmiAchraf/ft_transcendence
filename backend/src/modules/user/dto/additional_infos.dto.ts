import { IsString, IsDate } from 'class-validator';

export class AdditionalInfo {
	@IsString()
	nickname: string;

	@IsString()
	fullname: string;

	@IsString()
	gender: string;

	// @IsString()
	avatar: string;
}
