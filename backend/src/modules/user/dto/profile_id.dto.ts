import { IsString, Matches } from "class-validator";

export class ProfileId {
	@IsString()
	@Matches(/^[0-9]+$/, { message: 'Profile Id should contain only digits' })
	profileId: string;
}
