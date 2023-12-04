import { IsInt, IsString, Matches } from "class-validator";

export class ProfileId {
	@IsInt()
	// @Matches(/^[0-9]+$/, { message: 'Profile Id should contain only digits' })
	profileId: string;
}
