import { IsInt, IsString, Matches } from "class-validator";

export class DmDto {
	@IsInt()
	profileId: number;

	@IsString()
	message: string;
}