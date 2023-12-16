import { IsInt, IsOptional, IsString } from "class-validator";

export class ChannelPasswordDto {
	@IsInt()
	channelId: string;

	@IsOptional()
	@IsString()
	password: string;
}
