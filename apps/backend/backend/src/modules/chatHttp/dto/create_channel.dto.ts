import { Length, IsString, Matches, IsOptional } from "class-validator";

export class CreateChannelDto {
	@IsString()
	@Length(5, 20, { message: 'Channel name should be between 5 and 20 characters' })
	@Matches(/^[a-zA-Z0-9]+$/, { message: 'Username should contain only letters and digits' })
	channelName: string;

	@IsString()
	privacy: string;

	@IsOptional()
	@IsString()
	password: string;

	avatar: string;
}
