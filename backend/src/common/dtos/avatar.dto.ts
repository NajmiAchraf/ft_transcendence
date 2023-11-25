import { IsDefined, IsNotEmpty, IsObject, IsString } from "class-validator";

export class avatarDto {
	@IsDefined()
	@IsString()
	originalname: string;

	@IsDefined()
	@IsString()
	filename: string;

	@IsDefined()
	@IsNotEmpty()
	buffer: Buffer;
}
