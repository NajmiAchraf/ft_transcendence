import { SetMetadata } from "@nestjs/common";

// Set it a public route for access token guard
export const AtPublic = () => SetMetadata('isAtPublic', true);

// Set it a public route for block check guard
export const BlockPublic = () => SetMetadata('isBlockPublic', true);

// Set it a public route for friend check guard
export const FriendPublic = () => SetMetadata('isFriendPublic', true);
