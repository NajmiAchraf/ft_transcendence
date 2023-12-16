import { IsDefined, IsNotEmpty, IsObject, IsString, Length } from "class-validator";

export class avatarDto {
	@IsDefined()
	@IsString()
	originalname: string;

	@IsDefined()
	@IsString()
	@Length(1, 255)
	path: string;

	@IsDefined()
	@IsNotEmpty()
	buffer: Buffer;
}
