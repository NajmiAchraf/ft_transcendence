'use client';

import { useEffect, useState } from 'react'

import Game from '@/app/(game)/ping-pong/game/Game';

import { useCanvasContext } from '@/app/(game)/ping-pong/context/CanvasContext';
import { usePropsContext } from '@/app/(game)/ping-pong/context/PropsContext';
import { useWebSocketContext } from '@/app/(game)/ping-pong/context/WebSocketContext';

import '@/app/(game)/ping-pong.css'

function Service(setInGame: (inGame: boolean) => void) {
	const canvasContext = useCanvasContext();
	const propsContext = usePropsContext();
	const webSocketContext = useWebSocketContext();
	const webSocketGame = webSocketContext.socketGame;

	let [readyPlay, setReadyPlay] = useState<boolean>(false);
	let [startPlay, setStartPlay] = useState<boolean>(false);
	let [endGame, setEndGame] = useState<boolean>(true);

	let game: Game;
	let dataPlayer: any | undefined = undefined;

	useEffect(() => {
		function SocketService() {
			try {
				const getSocket = () => {
					return webSocketContext.socketGame;
				};

				const getProps = () => {
					return propsContext.props;
				}

				const getCanvas = () => {
					return canvasContext.canvas;
				}

				const getDataPlayer = () => {
					return dataPlayer;
				};

				const initGame = () => {
					console.log("initGame => readyPlay: ", propsContext.props.readyPlay, " apply: ", endGame);
					if (endGame) {
						readyPlay = true;
						startPlay = false;
						endGame = false;

						propsContext.props.readyPlay = true;
						propsContext.props.startPlay = false;
						propsContext.props.endGame = false;

						game = new Game(getSocket, getProps, getCanvas, getDataPlayer);

						console.log("game.room: ", game.room);
					}
				}

				const runGame = () => {
					console.log("runGame => startPlay: ", propsContext.props.startPlay, " apply: ", readyPlay);
					if (readyPlay) {
						readyPlay = false;
						startPlay = true;
						endGame = false;

						propsContext.props.readyPlay = true;
						propsContext.props.startPlay = true;
						propsContext.props.endGame = false;

						game.run();

					}
				}

				const stopGame = () => {
					console.log("stopGame => endGame: ", propsContext.props.endGame, " apply: ", startPlay);
					if (startPlay) {
						readyPlay = false;
						startPlay = false;
						endGame = true;

						propsContext.props.readyPlay = false;
						propsContext.props.startPlay = false;
						propsContext.props.endGame = true;

						game.stop();
					}
				}

				const winGame = () => {
					console.log("winGame => endGame: ", propsContext.props.endGame);
					if (!endGame) {
						endGame = true;
						propsContext.props.endGame = true;

						game.win();
					}
				}

				const loseGame = () => {
					console.log("loseGame => endGame: ", propsContext.props.endGame);
					if (!endGame) {
						endGame = true;
						propsContext.props.endGame = true;
						game.lose();
					}
				}

				const services = () => {
					webSocketGame.on("connect", () => {
						console.log("Connected to namespace: /ping-pong");
					});

					webSocketGame.on("dataPlayer", (data: any) => {
						console.log("dataPlayer: ", data);
						dataPlayer = data;
					});

					webSocketGame.on("allowToPlay", (data: any) => {
						setInGame(true);

						console.log("allowToPlay: ", data);
					});

					webSocketGame.on("denyToPlay", (data: any) => {
						setInGame(false);

						console.log("denyToPlay: ", data);
					});

					webSocketGame.on("leaveRoom", (data: any) => {
						stopGame();
						setInGame(false);

						console.log("leaveRoom: ", data);
					});

					webSocketGame.on("leaveQueue", (data: any) => {
						setInGame(false);

						console.log("leaveQueue: ", data);
					});
				};

				const serviceGame = () => {
					webSocketGame.on("roomConstruction", () => {
						initGame();
					});

					webSocketGame.on("startPlay", (data: any) => {
						console.log("startPlay: ", data);
						runGame();
					});

					webSocketGame.on("roomDestruction", (roomDestruction: string) => {
						console.log("roomDestruction: ", roomDestruction);
						stopGame();
					});

					webSocketGame.on("youWin", (data: any) => {
						console.log("youWin: ", data);
						winGame();
					});

					webSocketGame.on("youLose", (data: any) => {
						console.log("youLose: ", data);
						loseGame();
					});
				}

				services();
				serviceGame();
			} catch (error) {
				console.error(error);
			}
		}

		SocketService();

	}, [propsContext, canvasContext]);
};

export default Service;
