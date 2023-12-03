import { IsString } from "class-validator";

export class ChannelPasswordDto {
	@IsString()
	channelId: string;
	@IsString()
	password: string;
}
