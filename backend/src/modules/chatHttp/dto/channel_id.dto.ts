import { IsString, Matches } from "class-validator";

export class ChannelIdDto {
	@IsString()
	@Matches(/^[0-9]+$/, { message: 'Channel Id should contain only digits' })
	channelId: string;
}
