import { IsInt, IsString, Matches } from "class-validator";

export class DmDto {
	@IsInt()
	receiverId: number;

	@IsString()
	message: string;
}