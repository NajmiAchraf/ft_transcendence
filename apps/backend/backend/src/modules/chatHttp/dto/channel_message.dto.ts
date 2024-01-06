import { IsInt, IsString, Matches, Length } from "class-validator";

export class ChannelMessageDto {
	@IsInt()
	// @Matches(/^[0-9]+$/, { message: 'Channel Id should contain only digits' })
	channelId: string;

	@IsString()
	@Length(1, 200)
	message: string;
}
