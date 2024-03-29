import { IsInt, IsString, Matches } from "class-validator";

export class ChannelIdDto {
	@IsInt()
	// @Matches(/^[0-9]+$/, { message: 'Channel Id should contain only digits' })
	channelId: string;
}
