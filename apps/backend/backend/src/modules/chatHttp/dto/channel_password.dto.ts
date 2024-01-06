import { IsInt, IsOptional, IsString, Length } from "class-validator";

export class ChannelPasswordDto {
	@IsInt()
	channelId: string;

	@IsOptional()
	@IsString()
	@Length(8, 20)
	password: string;
}
