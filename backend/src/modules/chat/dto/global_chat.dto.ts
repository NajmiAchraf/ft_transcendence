export class GlobalChatDto {
	readonly message: string;
}

export class UpdateChatDto {
	readonly message: string;
	readonly messageId: number;
	readonly userId: number;
}

export class RemoveChatDto {
	readonly messageId: number;
	readonly userId: number;
}
