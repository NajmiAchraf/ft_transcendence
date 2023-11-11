import * as THREE from 'three'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { FontLoader, Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import Game from './Game'
import { vars, Geometry } from '../common/Common'

class Table {
	board: Board;
	game: Game;
	canvas: HTMLCanvasElement;
	width: number;
	height: number;
	depth: number;

	constructor(board: Board, width: number, height: number, depth: number) {
		this.board = board;
		this.game = board.game;
		this.canvas = this.game.canvas;
		this.width = width;
		this.height = height;
		this.depth = depth;
	}

	tableSetup(z: number = 0) {
		vars.z += z;

		const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
		const material = new THREE.MeshPhysicalMaterial({
			color: 0x000000,
			metalness: 0.2,
			roughness: 0.5,
			transmission: 0.9,
			envMapIntensity: 1.0,
			opacity: 0.8,
			reflectivity: 0.9,
			side: THREE.DoubleSide,
		});
		const table = new THREE.Mesh(geometry, material);
		this.game.scene.add(table);
		table.position.set(this.board.x, this.board.y, vars.z);
	}

	mirrorSetup(z: number = 0) {
		vars.z += z;

		let geometry = new THREE.BoxGeometry(this.width, this.height, this.depth)

		let board = new Reflector(geometry, {
			color: 0x000000,
			textureWidth: this.canvas.clientWidth * window.devicePixelRatio,
			textureHeight: this.canvas.clientHeight * window.devicePixelRatio,
			clipBias: 0.003,
			multisample: 10,
		});

		this.game.scene.add(board);
		board.position.set(this.board.x, this.board.y, vars.z)

		return board
	}
}

class Net {
	board: Board;
	game: Game;
	width: number;
	height: number;
	depth: number;

	constructor(board: Board, width: number, height: number, depth: number) {
		this.board = board;
		this.game = board.game;
		this.width = width;
		this.height = height;
		this.depth = depth;
	}

	setup(z: number = 0, numberOfNetParts: number) {
		const emptySpaceHeight = this.height / 80;
		const netLineWidth = this.width / 200;
		const netPartHeight = (this.height - (emptySpaceHeight * (numberOfNetParts - 1))) / numberOfNetParts;
		let currentY = this.board.y - this.height / 2 + netPartHeight / 2;

		for (let i = 0; i < numberOfNetParts; i++) {
			this.createNetPart(netLineWidth / 2, currentY, z + this.depth / 2, netLineWidth, netPartHeight, this.depth);
			currentY += netPartHeight + emptySpaceHeight;
		}
	}

	createNetPart(x: number, y: number, z: number, width: number, height: number, depth: number) {
		const geometry = new THREE.BoxGeometry(width, height, depth);
		const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
		const netPart = new THREE.Mesh(geometry, material);
		netPart.position.set(x, y, z);
		this.game.scene.add(netPart);
	}
}

export class Text {

	position: THREE.Vector3;
	text: THREE.Mesh | null = null;
	game: Game;
	oldText: string = "";

	static font: Font;
	static async loadFont() {
		const fontLoader = new FontLoader();
		Text.font = await fontLoader.loadAsync("/font/Digital_7_Mono.typeface.json")
	}

	constructor(game: Game, position: THREE.Vector3) {
		this.game = game;
		this.position = position;
	}

	set(text: string, x: number = 0, size: number = vars.font_size, height: number = vars.font_height) {
		if (text !== this.oldText) {
			if (this.text) {
				this.text.geometry.dispose();
				this.game.scene.remove(this.text);
			}

			const textGeometry = new TextGeometry(text, {
				font: Text.font,
				size: size,
				height: height,
			});

			const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
			const textMesh = new THREE.Mesh(textGeometry, textMaterial);
			textMesh.position.set(this.position.x - x, this.position.y, this.position.z);
			this.game.scene.add(textMesh);
			this.text = textMesh;
			this.oldText = text;
		}
	}
}

class Score {
	board: Board;
	game: Game;

	score1: Text;
	score2: Text;

	constructor(board: Board) {
		this.board = board;
		this.game = board.game;
		this.score1 = new Text(this.game, new THREE.Vector3(-vars.width / 10, vars.height / 2 - vars.height / 10, vars.z + vars.font_height));
		this.score2 = new Text(this.game, new THREE.Vector3(vars.width / 10, vars.height / 2 - vars.height / 10, vars.z + vars.font_height));
	}

	// Update scores with animations
	updateScores(player1Score: number, player2Score: number): void {
		const length = player1Score.toString().length;
		const x1 = vars.font_size / 2 * length;

		this.score1.set(player1Score.toString(), x1);
		this.score2.set(player2Score.toString());
	}
}

class EndGame {
	board: Board;
	game: Game;

	constructor(board: Board) {
		this.board = board;
		this.game = board.game;
	}

	set(x: number, y: number, z: number, state: string, size: number) {
		const text = new Text(this.game, new THREE.Vector3(x, y, vars.z + vars.font_height + z));
		text.set(state, 0, size);
	}
}


class Border {
	board: Board;
	game: Game;
	width: number;
	height: number;
	depth: number;

	constructor(board: Board, width: number, height: number) {
		this.board = board;
		this.game = board.game;
		this.width = width;
		this.height = height;
		this.depth = vars.depth;
	}

	private setupBoxBorder(x: number, y: number, width: number, height: number, color: number) {
		const geometry = new THREE.BoxGeometry(width, height, this.depth + vars.z + 2);
		const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
		const border = new THREE.Mesh(geometry, material);
		this.game.scene.add(border);
		border.position.set(x, y, vars.depth / 2 + this.depth / 2 + vars.z_glass);
	}
	// private setupVerticalCapsuleBorder(x: number, y: number, width: number, height: number, color: number) {
	// 	const geometry = new THREE.CapsuleGeometry(height, width - height * 8, 16, 32);
	// 	const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
	// 	const border = new THREE.Mesh(geometry, material);
	// 	this.game.scene.add(border);
	// 	border.position.set(x, y, 0);
	// }
	private setupCapsuleBorder(x: number, y: number, width: number, height: number, color: number, horizontal: boolean) {
		const geometry = new THREE.CapsuleGeometry(height, width - height * 2, 16, 32);
		const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
		const border = new THREE.Mesh(geometry, material);
		this.game.scene.add(border);
		border.position.set(x, y, vars.depth / 2 + this.depth / 2 + vars.z_glass);
		// rotate
		if (horizontal)
			border.rotateZ(Math.PI / 2);
	}

	private boxSetup() {
		const colors = [0xd5563c, 0x52397a]
		const height = this.height / 50;

		this.setupBoxBorder(-this.width / 2 + this.width / (colors.length * 2) - height, this.height / 2 + height / 2, this.width / colors.length, height, colors[0]);
		this.setupBoxBorder(this.width / 2 - this.width / (colors.length * 2) + height, this.height / 2 + height / 2, this.width / colors.length, height, colors[colors.length - 1]);
		this.setupBoxBorder(-this.width / 2 + this.width / (colors.length * 2) - height, -this.height / 2 - height / 2, this.width / colors.length, height, colors[colors.length - 1]);
		this.setupBoxBorder(this.width / 2 - this.width / (colors.length * 2) + height, -this.height / 2 - height / 2, this.width / colors.length, height, colors[0]);
		// draw horizontal borders each color in part of the board
		for (let i = 0; i < colors.length; i++) {
			this.setupBoxBorder(-this.width / 2 + i * this.width / colors.length + this.width / (colors.length * 2), this.height / 2 + height / 2, this.width / colors.length, height, colors[i]);
		}
		for (let i = 0; i < colors.length; i++) {
			this.setupBoxBorder(-this.width / 2 + i * this.width / colors.length + this.width / (colors.length * 2), -this.height / 2 - height / 2, this.width / colors.length, height, colors[colors.length - i - 1]);
		}
		// draw vertical borders each color in part of the board
		for (let i = 0; i < colors.length; i++) {
			this.setupBoxBorder(-this.width / 2 - height / 2, this.height / 2 - i * this.height / colors.length - this.height / (colors.length * 2), height, this.height / colors.length, colors[i]);
		}
		for (let i = 0; i < colors.length; i++) {
			this.setupBoxBorder(this.width / 2 + height / 2, this.height / 2 - i * this.height / colors.length - this.height / (colors.length * 2), height, this.height / colors.length, colors[colors.length - i - 1]);
		}

	}

	private capsuleSetup() {
		const colors = [0xd5563c, 0x52397a]
		const height = this.height / 100;

		// draw vertical borders each color in part of the board
		for (let i = 0; i < colors.length; i++) {
			this.setupCapsuleBorder(-this.width / 2 - height / 2, this.height / 2 - i * this.height / colors.length - this.height / (colors.length * 2), this.height / colors.length, height, colors[i], false);
		}
		for (let i = 0; i < colors.length; i++) {
			this.setupCapsuleBorder(this.width / 2 + height / 2, this.height / 2 - i * this.height / colors.length - this.height / (colors.length * 2), this.height / colors.length, height, colors[colors.length - i - 1], false);
		}
		// draw horizontal borders each color in part of the board
		for (let i = 0; i < colors.length; i++) {
			this.setupCapsuleBorder(-this.width / 2 + i * this.width / colors.length + this.width / (colors.length * 2), this.height / 2 + height / 2, this.width / colors.length, height, colors[i], true);
		}
		for (let i = 0; i < colors.length; i++) {
			this.setupCapsuleBorder(-this.width / 2 + i * this.width / colors.length + this.width / (colors.length * 2), -this.height / 2 - height / 2, this.width / colors.length, height, colors[colors.length - i - 1], true);
		}
	}

	borderSetup(geometry: Geometry) {
		if (geometry === "cube")
			this.boxSetup();
		else if (geometry === "sphere")
			this.capsuleSetup();
		else
			throw new Error("Invalid geometry");
	}
}

export default class Board {
	game: Game;

	width: number;
	height: number;
	depth: number;
	geometry: Geometry;
	oldScore: number[];

	table: Table;
	net: Net;
	score: Score;
	border: Border;
	endGame: EndGame;

	x: number = 0;
	y: number = 0;

	constructor(game: Game, width: number, height: number, depth: number, geometry: Geometry, mirror: boolean) {
		this.game = game;
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.geometry = geometry;

		this.table = new Table(this, width, height, depth);
		this.net = new Net(this, width, height, depth);
		this.score = new Score(this);
		this.border = new Border(this, width, height);
		this.endGame = new EndGame(this);
		this.oldScore = [0, 0];
		this.setup(mirror);
	}

	setup(mirror: boolean) {
		if (mirror)
			this.table.mirrorSetup();
		else
			this.table.tableSetup();
		this.net.setup(1, 30);
		this.border.borderSetup(this.geometry);
	}

	updateScores(player1Score: number, player2Score: number) {
		this.score.updateScores(player1Score, player2Score);
	}

	endState(text: string, length: number) {
		const x = - vars.font_size * (length + 2) / 2;
		const y = vars.font_size;
		this.endGame.set(x, y, vars.z_glass, text, vars.font_size * 2);
	}

	lose() {
		this.endState("Game Over\n You Lose", "Game Over".length);
	}

	win() {
		this.endState("Game Over\n You Win", "Game Over".length);
	}

	update(): void {
		this.updateScores(this.game.player1.score, this.game.player2.score);
	}
}
