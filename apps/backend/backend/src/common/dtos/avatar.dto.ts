import { IsDefined, IsNotEmpty, IsObject, IsString, Length } from "class-validator";

export class avatarDto {
	@IsDefined()
	@IsString()
	originalname: string;

	@IsDefined()
	@IsString()
	@Length(1, 200)
	path: string;

	@IsDefined()
	@IsNotEmpty()
	buffer: Buffer;
}
