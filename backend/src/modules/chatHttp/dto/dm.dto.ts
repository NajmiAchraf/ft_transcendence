import { IsInt, IsString, Matches } from "class-validator";

export class DmDto {
	@IsInt()
	// @Matches(/^[0-9]+$/, { message: 'Receiver Id should contain only digits' })
	receiverId: number;

	@IsString()
	message: string;
}