import { IsString, Matches } from "class-validator";

export class DmDto {
	@IsString()
	@Matches(/^[0-9]+$/, { message: 'Receiver Id should contain only digits' })
	receiverId: number;

	@IsString()
	message: string;
}