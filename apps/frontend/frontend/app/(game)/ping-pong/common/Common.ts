'use client';

export type Canvas = HTMLCanvasElement | null;
export type Side = "left" | "right";
export type Mode = "easy" | "medium" | "hard";
export type Geometry = "cube" | "sphere";
export type PlayerType = "player" | "bot";
export type PlayStates = 'readyPlay' | 'startPlay' | 'endPlay';
export type GameStates = 'settings' | 'wait' | 'play';
export type DevMode = 'none' | 'all' | 'camera' | 'paddle-bot';

export let vars = {
	speed_init: 600 / 120,
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

export type Props = {
	devMode: DevMode,
	geometry: Geometry,
	reflection: boolean,
	mode: Mode,
	side: Side,
	playerType: PlayerType,
	player1ID: string;
	player2ID: string;
	player1Name: string,
	player2Name: string,
	player1Avatar: any,
	player2Avatar: any,
}

export type Options = {
	invite: boolean,
	readyPlay: boolean,
	startPlay: boolean,
	inGame: boolean,
	endGame: boolean,
}
