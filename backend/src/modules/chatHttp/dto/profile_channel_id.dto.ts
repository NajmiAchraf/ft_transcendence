import { IsString, Matches } from "class-validator";

export class ProfileChannelIdDto {
	@IsString()
	@Matches(/^[0-9]+$/, { message: 'Profile Id should contain only digits' })
	profileId: string;

	@IsString()
	@Matches(/^[0-9]+$/, { message: 'Channel Id should contain only digits' })
	channelId: string;
}
