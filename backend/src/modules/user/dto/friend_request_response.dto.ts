import { IsString, Matches } from "class-validator";

export class FriendRequestResponseDto {
	@IsString()
	@Matches(/^[0-9]+$/, { message: 'Profile Id should contain only digits' })
	profileId: string;

	@IsString()
	@Matches(/^(accept|reject)$/, {
		message: 'response should be either "accept" or "reject"',
	})
	friendRequestResponse: string;
}
