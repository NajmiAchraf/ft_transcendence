export type Side = "left" | "right";
export type Mode = "easy" | "medium" | "hard";
export type Geometry = "cube" | "sphere";
export type PlayerType = "player" | "bot";
export type PlayStates = 'readyPlay' | 'startPlay' | 'endPlay';
export type GameStates = 'settings' | 'wait' | 'play';

export let vars = {
	speed_init: 600 / 120, //! depend on width
	width: 600,
	height: 400,
	depth: 4,
	z: 0,
	z_glass: 5,
	scale_width: 30,
	scale_height: 6,
	font_size: 30,
	font_height: 2,
}

export type GameResultType = {
	readonly winnerId: number;
	readonly loserId: number;
	readonly winnerScore: number;
	readonly loserScore: number;
	readonly startTime: Date;
	readonly endTime: Date;
}
