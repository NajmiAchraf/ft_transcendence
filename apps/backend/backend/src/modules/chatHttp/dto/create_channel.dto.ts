import { Length, IsString, Matches, IsOptional } from "class-validator";

export class CreateChannelDto {
	@IsString()
	@Length(5, 20, { message: 'Channel name should be between 5 and 20 characters' })
	@Matches(/^[a-zA-Z0-9]+$/, { message: 'channelName should contain only letters and digits' })
	channelName: string;

	@IsString()
	@Matches(/^(private|protected|public)$/)
	privacy: string;

	@IsOptional()
	@IsString()
	@Length(8, 20)
	password: string;

	avatar: string;
}
