'use client';

import * as THREE from 'three'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { FontLoader, Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import Game from '@/app/(game)/ping-pong/game/Game'
import { vars, Geometry } from '@/app/(game)/ping-pong/common/Common'

const ReflectorShader = {

	name: 'ReflectorShaderWithOpacity',

	uniforms: {

		'color': {
			value: null
		},

		'tDiffuse': {
			value: null
		},

		'textureMatrix': {
			value: null
		}

	},

	vertexShader: /* glsl */`
		uniform mat4 textureMatrix;
		varying vec4 vUv;

		#include <common>
		#include <logdepthbuf_pars_vertex>

		void main() {

			vUv = textureMatrix * vec4( position, 1.0 );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			#include <logdepthbuf_vertex>

		}`,

	fragmentShader: /* glsl */`
		uniform vec3 color;
		uniform sampler2D tDiffuse;
		varying vec4 vUv;

		#include <logdepthbuf_pars_fragment>

		float blendOverlay( float base, float blend ) {

			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

		}

		vec3 blendOverlay( vec3 base, vec3 blend ) {

			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

		}

		void main() {

			#include <logdepthbuf_fragment>

			vec4 base = texture2DProj( tDiffuse, vUv );
			gl_FragColor = vec4( blendOverlay( base.rgb, color ), 0.1 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`
};

class Table {
	table: THREE.Mesh | null = null;
	reflector: Reflector | null = null;
	geometry: THREE.BoxGeometry[] = [];
	material: THREE.MeshPhysicalMaterial | null = null;

	board: Board;
	game: Game;
	canvas: HTMLCanvasElement;
	scene: THREE.Scene;

	width: number;
	height: number;
	depth: number;

	constructor(board: Board, width: number, height: number, depth: number) {
		this.board = board;
		this.game = board.game;
		this.canvas = this.game.canvas;
		this.scene = this.game.scene;

		this.width = width;
		this.height = height;
		this.depth = depth;
	}

	tableSetup() {
		const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
		this.material = new THREE.MeshPhysicalMaterial({
			color: 0x000000,
			metalness: 0.2,
			roughness: 0.5,
			transmission: 0.9,
			envMapIntensity: 1.0,
			side: THREE.DoubleSide,
		});
		this.table = new THREE.Mesh(geometry, this.material);
		this.scene.add(this.table);
		this.table.position.set(this.board.x, this.board.y, vars.z);
		this.geometry.push(geometry);
	}

	reflectorSetup(z: number) {
		vars.z += z;

		const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);

		const reflectorOptions = {
			color: new THREE.Color(0x000000),
			textureWidth: this.canvas.clientWidth * window.devicePixelRatio,
			textureHeight: this.canvas.clientHeight * window.devicePixelRatio,
			clipBias: 0.003,
			shader: ReflectorShader,
		};

		this.reflector = new Reflector(geometry, reflectorOptions);
		(this.reflector.material as THREE.Material).transparent = true;

		this.scene.add(this.reflector);
		this.reflector.position.set(this.board.x, this.board.y, vars.z);
		this.geometry.push(geometry);
	}

	dispose() {
		for (let i = 0; i < this.geometry.length; i++) {
			this.geometry[i].dispose();
		}
		if (this.table) {
			this.material?.dispose();
			this.scene.remove(this.table);
		}
		if (this.reflector) {
			this.reflector.dispose();
			this.scene.remove(this.reflector);
		}
	}

	update() { }
}

class Net {
	nets: THREE.Mesh[] = [];
	geometry: THREE.BoxGeometry[] = [];
	material: THREE.MeshBasicMaterial[] = [];

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

	setup(numberOfNetParts: number) {
		const emptySpaceHeight = this.height / 80;
		const netLineWidth = this.width / 200;
		const netPartHeight = (this.height - (emptySpaceHeight * (numberOfNetParts - 1))) / numberOfNetParts;
		let currentY = this.board.y - this.height / 2 + netPartHeight / 2;

		for (let i = 0; i < numberOfNetParts; i++) {
			this.createNetPart(netLineWidth / 2, currentY, netLineWidth, netPartHeight, this.depth);
			currentY += netPartHeight + emptySpaceHeight;
		}
	}

	createNetPart(x: number, y: number, width: number, height: number, depth: number) {
		const geometry = new THREE.BoxGeometry(width, height, depth);
		const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
		const netPart = new THREE.Mesh(geometry, material);
		netPart.position.set(x, y, vars.z + depth);
		this.game.scene.add(netPart);

		this.geometry.push(geometry);
		this.material.push(material);
		this.nets.push(netPart);
	}

	disposeNet() {
		for (let i = 0; i < this.nets.length; i++) {
			this.geometry[i].dispose();
			this.material[i].dispose();
			this.game.scene.remove(this.nets[i]);
		}
	}
}

export class Text {
	textGeometry: TextGeometry | null = null;
	textMaterial: THREE.MeshBasicMaterial | null = null;
	textMesh: THREE.Mesh | null = null;

	position: THREE.Vector3;
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
			if (this.textMesh) {
				this.textGeometry?.dispose();
				this.textMaterial?.dispose();
				this.game.scene.remove(this.textMesh);
			}

			this.textGeometry = new TextGeometry(text, {
				font: Text.font,
				size: size,
				height: height,
			});

			this.textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

			this.textMesh = new THREE.Mesh(this.textGeometry, this.textMaterial);
			this.textMesh.position.set(this.position.x - x, this.position.y, this.position.z);

			this.game.scene.add(this.textMesh);

			this.oldText = text;
		}
	}

	dispose() {
		if (this.textMesh) {
			this.textGeometry?.dispose();
			this.textMaterial?.dispose();
			this.game.scene.remove(this.textMesh);
		}
	}
}

class Score {
	board: Board;
	game: Game;

	score1: Text;
	score2: Text;

	firstUpdate: boolean = false;

	constructor(board: Board) {
		this.board = board;
		this.game = board.game;
		this.score1 = new Text(this.game, new THREE.Vector3(-vars.width / 10, vars.height / 2 - vars.height / 10, vars.z + vars.font_height));
		this.score2 = new Text(this.game, new THREE.Vector3(vars.width / 10, vars.height / 2 - vars.height / 10, vars.z + vars.font_height));
	}

	// Update scores with animations
	updateScores(player1Score: number, player2Score: number): void {
		if (!this.firstUpdate) {
			this.firstUpdate = true;
			this.score1.position.set(-vars.width / 10, vars.height / 2 - vars.height / 10, vars.z + vars.font_height);
			this.score2.position.set(vars.width / 10, vars.height / 2 - vars.height / 10, vars.z + vars.font_height);
		}

		const length = player1Score.toString().length;
		const x1 = vars.font_size / 2 * length;

		this.score1.set(player1Score.toString(), x1);
		this.score2.set(player2Score.toString());
	}

	dispose() {
		this.score1.dispose();
		this.score2.dispose();
	}
}

class EndGame {
	endMesh: Text | null = null;
	board: Board;
	game: Game;

	constructor(board: Board) {
		this.board = board;
		this.game = board.game;
	}

	set(x: number, y: number, z: number, state: string, size: number) {
		this.endMesh = new Text(this.game, new THREE.Vector3(x, y, vars.z + vars.font_height + z));
		this.endMesh.set(state, 0, size);
	}

	dispose() {
		if (this.endMesh) {
			this.endMesh.dispose();
		}
	}
}

class Border {
	boarder: THREE.Mesh[] = [];
	geometry: THREE.BoxGeometry[] = [];
	material: THREE.ShaderMaterial[] = [];

	board: Board;
	game: Game;
	width: number;
	height: number;
	depth: number;
	baseWH: number;

	constructor(board: Board, width: number, height: number) {
		this.board = board;
		this.game = board.game;
		this.width = width;
		this.height = height;
		this.depth = (vars.depth + vars.z_glass + vars.z) * 2
		this.baseWH = height / (vars.scale_width * 3);
	}

	private createBorderShaderMaterial(colors: number[], isHorizontal: boolean) {
		const [color1, color2, color3, color4] = colors.map(color => new THREE.Color(color));

		return new THREE.ShaderMaterial({
			uniforms: {
				color1: { value: color1 },
				color2: { value: color2 },
				color3: { value: color3 },
				color4: { value: color4 },
				isHorizontal: { value: isHorizontal }
			},
			vertexShader: `
				varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform vec3 color1;
				uniform vec3 color2;
				uniform vec3 color3;
				uniform vec3 color4;
				uniform bool isHorizontal;
				varying vec2 vUv;

				void main() {
					float factor = isHorizontal ? vUv.x : vUv.y;
					vec3 color = mix(color1, color2, factor);
					color = mix(color, color3, factor);
					color = mix(color, color4, factor);
					gl_FragColor = vec4(color, 1.0);
				}
			`,
			wireframe: false
		});
	}

	private setupBoxBorder(x: number, y: number, width: number, height: number, colors: number[], isHorizontal: boolean) {
		const geometry = new THREE.BoxGeometry(width, height, this.depth);
		var material = this.createBorderShaderMaterial(colors, isHorizontal);
		const border = new THREE.Mesh(geometry, material);
		this.game.scene.add(border);
		border.position.set(x, y, this.depth / 2 - vars.depth / 2);

		this.geometry.push(geometry);
		this.material.push(material);
		this.boarder.push(border);
	}

	private setup() {
		const orange_blue = [0xD75433, 0xAD4366, 0x833298, 0x5921CB];
		const blue_orange = [0x5921CB, 0x833298, 0xAD4366, 0xD75433];

		// draw horizontal borders
		this.setupBoxBorder(
			0,
			this.height / 2 + this.baseWH / 2,
			this.width + this.baseWH * 2,
			this.baseWH,
			blue_orange,
			true
		);

		this.setupBoxBorder(
			0,
			-this.height / 2 - this.baseWH / 2,
			this.width + this.baseWH * 2,
			this.baseWH,
			orange_blue,
			true
		);

		// draw vertical borders
		this.setupBoxBorder(
			-this.width / 2 - this.baseWH / 2,
			0,
			this.baseWH,
			this.height + this.baseWH * 2,
			orange_blue,
			false
		);

		this.setupBoxBorder(
			this.width / 2 + this.baseWH / 2,
			0,
			this.baseWH,
			this.height + this.baseWH * 2,
			blue_orange,
			false
		);

	}

	borderSetup() {
		this.setup();
	}

	disposeBorder() {
		for (let i = 0; i < this.boarder.length; i++) {
			this.geometry[i].dispose();
			this.material[i].dispose();
			this.game.scene.remove(this.boarder[i]);
		}
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

	reflector: boolean;

	constructor(game: Game, width: number, height: number, depth: number, geometry: Geometry, reflector: boolean) {
		this.game = game;
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.geometry = geometry;

		this.reflector = reflector;

		this.table = new Table(this, width, height, depth);
		this.net = new Net(this, width, height, depth);
		this.score = new Score(this);
		this.border = new Border(this, width, height);
		this.endGame = new EndGame(this);
		this.oldScore = [0, 0];
		this.setup();
	}

	setup() {
		if (this.reflector) {
			this.table.tableSetup();
			this.table.reflectorSetup(this.depth);
		}
		else
			this.table.tableSetup();
		this.net.setup(30);
		this.border.borderSetup();
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
		this.table.update();
	}

	dispose() {
		this.table.dispose();
		this.net.disposeNet();
		this.border.disposeBorder();
		this.score.dispose();
		this.endGame.dispose();
	}
}
