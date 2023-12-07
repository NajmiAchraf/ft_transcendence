'use client';

import * as THREE from 'three'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { FontLoader, Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import Game from '@/app/(game)/ping-pong/game/Game'
import { vars, Geometry } from '@/app/(game)/ping-pong/common/Common'

const reflectorShader = {
	// name: 'reflector',

	// defines: {
	// 	'DISTANCE_ATTENUATION': true,
	// 	'FRESNEL': true
	// },

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

	vertexShader: [
		'uniform mat4 textureMatrix;',
		'varying vec4 vUv;',

		'void main() {',

		'	vUv = textureMatrix * vec4( position, 1.0 );',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'
	].join('\n'),

	fragmentShader: [
		'uniform vec3 color;',
		'uniform float opacity;',
		'uniform sampler2D tDiffuse;',
		'varying vec4 vUv;',

		'float blendOverlay( float base, float blend ) {',

		'	return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );',

		'}',

		'vec3 blendOverlay( vec3 base, vec3 blend ) {',

		'	return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );',

		'}',

		'void main() {',

		'	vec4 base = texture2DProj( tDiffuse, vUv );',
		'	gl_FragColor = vec4( blendOverlay( base.rgb, color ), opacity );',

		'}'
	].join('\n')

};

class Table {
	table: THREE.Mesh | null = null;
	glass: Reflector | null = null;
	mirror: Reflector | null = null;
	geometry: THREE.BoxGeometry | null = null;
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

	tableSetup(z: number = 0) {
		vars.z += z;

		this.geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
		this.material = new THREE.MeshPhysicalMaterial({
			color: 0x000000,
			metalness: 0.2,
			roughness: 0.5,
			transmission: 0.9,
			envMapIntensity: 1.0,
			opacity: 0.8,
			reflectivity: 0.9,
			side: THREE.DoubleSide,
		});
		this.table = new THREE.Mesh(this.geometry, this.material);
		this.scene.add(this.table);
		this.table.position.set(this.board.x, this.board.y, vars.z);
	}

	mirrorSetup(z: number = 0) {
		vars.z += z;

		this.geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);

		const color = new THREE.Color(0x000000);
		const textureWidth = this.canvas.clientWidth * window.devicePixelRatio;
		const textureHeight = this.canvas.clientHeight * window.devicePixelRatio;
		const clipBias = 0.003;
		const multisample = 4;
		const opacity = 0.9;

		const renderTarget = new THREE.WebGLRenderTarget(textureWidth, textureHeight, { samples: multisample });

		var textureMatrix = new THREE.Matrix4();
		var shader = reflectorShader;
		var material = new THREE.ShaderMaterial({
			uniforms: THREE.UniformsUtils.merge([
				{
					opacity: {
						value: opacity
					}
				},
				shader.uniforms
			]),
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader
		});

		material.uniforms["tDiffuse"].value = renderTarget.texture;
		material.uniforms["color"].value = color;
		material.uniforms["textureMatrix"].value = textureMatrix;

		const reflectorOptions = {
			color: color,
			textureWidth: textureWidth,
			textureHeight: textureHeight,
			clipBias: clipBias,
		};

		this.glass = new Reflector(this.geometry, reflectorOptions);
		this.glass.material = material;
		this.glass.material.transparent = true;

		this.scene.add(this.glass);
		this.glass.position.set(this.board.x, this.board.y, vars.z);

		this.mirror = new Reflector(this.geometry, reflectorOptions);

		this.scene.add(this.mirror);
		this.mirror.position.set(this.board.x, this.board.y, vars.z - z);
	}

	disposeTable() {
		if (this.table) {
			this.geometry?.dispose();
			this.material?.dispose();
			this.scene.remove(this.table);
		}
	}

	disposeMirror() {
		this.geometry?.dispose();
		if (this.mirror) {
			this.mirror.dispose();
			this.scene.remove(this.mirror);
		}
		if (this.glass) {
			this.glass.dispose();
			this.scene.remove(this.glass);
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

	constructor(board: Board, width: number, height: number) {
		this.board = board;
		this.game = board.game;
		this.width = width;
		this.height = height;
		this.depth = vars.depth;
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
		const geometry = new THREE.BoxGeometry(width, height, this.depth + vars.z + 2, 1, 1, 1);
		var material = this.createBorderShaderMaterial(colors, isHorizontal);
		const border = new THREE.Mesh(geometry, material);
		this.game.scene.add(border);
		border.position.set(x, y, vars.depth / 2 + this.depth / 2 + vars.z_glass);

		this.geometry.push(geometry);
		this.material.push(material);
		this.boarder.push(border);
	}

	private setup() {
		const orange_blue = [0xD75433, 0xAD4366, 0x833298, 0x5921CB]
		const blue_orange = [0x5921CB, 0x833298, 0xAD4366, 0xD75433]
		const height = this.height / 50;

		// draw horizontal borders
		this.setupBoxBorder(
			0,
			this.height / 2 + height / 2,
			this.width + height * 2,
			height,
			blue_orange,
			true
		);

		this.setupBoxBorder(
			0,
			-this.height / 2 - height / 2,
			this.width + height * 2,
			height,
			orange_blue,
			true
		);

		// draw vertical borders
		this.setupBoxBorder(
			-this.width / 2 - height / 2,
			0,
			height,
			this.height + height * 2,
			orange_blue,
			false
		);

		this.setupBoxBorder(
			this.width / 2 + height / 2,
			0,
			height,
			this.height + height * 2,
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

	mirror: boolean;

	constructor(game: Game, width: number, height: number, depth: number, geometry: Geometry, mirror: boolean) {
		this.game = game;
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.geometry = geometry;

		this.mirror = mirror;

		this.table = new Table(this, width, height, depth);
		this.net = new Net(this, width, height, depth);
		this.score = new Score(this);
		this.border = new Border(this, width, height);
		this.endGame = new EndGame(this);
		this.oldScore = [0, 0];
		this.setup();
	}

	setup() {
		if (this.mirror)
			this.table.mirrorSetup();
		else
			this.table.tableSetup();
		this.net.setup(1, 30);
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
		if (this.mirror)
			this.table.disposeMirror();
		else
			this.table.disposeTable();
		this.net.disposeNet();
		this.border.disposeBorder();
		this.score.dispose();
		this.endGame.dispose();
	}
}
