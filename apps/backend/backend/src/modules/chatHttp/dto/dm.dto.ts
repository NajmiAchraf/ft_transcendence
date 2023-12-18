import { IsInt, IsString, Length } from "class-validator";

export class DmDto {
	@IsInt()
	profileId: number;

	@IsString()
	@Length(1, 200)
	message: string;
}