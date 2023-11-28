'use client';

import { useEffect } from 'react'

import Game from '@/app/(game)/ping-pong/game/Game';
import { Text } from '@/app/(game)/ping-pong/game/Board';

import { useCanvasContext } from '@/app/context/CanvasContext';
import { usePropsContext } from '@/app/context/PropsContext';
import { useWebSocketContext } from '@/app/context/WebSocketContext';

import '@/app/(game)/ping-pong.css'

function Service(setInGame: (inGame: boolean) => void) {
	const canvasContext = useCanvasContext();
	const propsContext = usePropsContext();
	const webSocketContext = useWebSocketContext();
	const webSocketGame = webSocketContext.game;

	let game: Game;
	let dataPlayer: any | undefined = undefined;

	useEffect(() => {
		async function SocketService() {
			try {
				await Text.loadFont();

				const getSocket = () => {
					return webSocketContext.game;
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

				const initialization = () => {
					webSocketGame.on("connect", () => {
						console.log("Connected to namespace: /ping-pong");
					});

					webSocketGame.on("roomConstruction", () => {
						console.log("propsContext.props.startPlay: ", propsContext.props.startPlay);
						if (!propsContext.props.readyPlay) {
							propsContext.props.endGame = false;
							propsContext.props.readyPlay = true;

							game = new Game(getSocket, getProps, getCanvas, getDataPlayer);

							console.log("game.room: ", game.room);
						}
					});

					webSocketGame.on("startPlay", (data: any) => {
						console.log("startPlay: ", data);
						if (!propsContext.props.startPlay) {
							propsContext.props.endGame = false;
							propsContext.props.startPlay = true;

							game.run();
						}
					});

					webSocketGame.on("roomDestruction", (roomDestruction: string) => {
						console.log("roomDestruction: ", roomDestruction);
						console.log("propsContext.props.startPlay: ", propsContext.props.startPlay);
						if (propsContext.props.startPlay) {
							propsContext.props.endGame = true;
							propsContext.props.startPlay = false;

							game.stop();
						}
					});

					webSocketGame.on("youWin", (data: any) => {
						console.log("youWin: ", data);
						if (!propsContext.props.endGame) {
							propsContext.props.endGame = true;
							game.win();
						}
					});

					webSocketGame.on("youLose", (data: any) => {
						console.log("youLose: ", data);
						console.log("propsContext.props.endGame: ", propsContext.props.endGame);
						if (!propsContext.props.endGame) {
							propsContext.props.endGame = true;
							game.lose();
						}
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
						setInGame(false);

						console.log("leaveRoom: ", data);
					});

					webSocketGame.on("leaveQueue", (data: any) => {
						setInGame(false);

						console.log("leaveQueue: ", data);
					});
				};

				initialization();
			} catch (error) {
				console.error(error);
			}
		}

		SocketService();

	}, [propsContext, canvasContext]);
};

export default Service;
