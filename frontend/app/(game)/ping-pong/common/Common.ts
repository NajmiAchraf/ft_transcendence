'use client';

export type Side = "left" | "right";
export type Mode = "easy" | "medium" | "hard";
export type Geometry = "cube" | "sphere";
export type PlayerType = "player" | "bot";

export let vars = {
	speed_init: 600 / 150, //! depend on width
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
	canvas: HTMLCanvasElement | null
	geometry: Geometry
	mirror: boolean
	mode: Mode
	playerType: PlayerType
	inGame: boolean
}
