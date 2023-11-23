'use client';

import { ReactNode, useEffect, useRef, useState } from 'react'

import Game from '@/app/(game)/ping-pong/game/Game';
import { Text } from '@/app/(game)/ping-pong/game/Board';

import { useCanvasContext } from '@/app/context/CanvasContext';
import { usePropsContext } from '@/app/context/PropsContext';
import { useWebSocketContext } from '@/app/context/WebSocketContext';

import '@/app/(game)/ping-pong.css'

export default function RootLayout({
	children,
}: {
	children: ReactNode
}) {
	const canvasContext = useCanvasContext();
	const propsContext = usePropsContext();
	const webSocketContext = useWebSocketContext();
	const webSocket = webSocketContext.webSocket;

	let game: Game;
	let dataPlayer: any | undefined = undefined;

	useEffect(() => {
		async function SocketService() {
			try {
				await Text.loadFont();

				const getSocket = () => {
					return webSocketContext.webSocket;
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
					webSocket.on("connect", () => {
						console.log("Connected to namespace: /ping-pong");
					});

					webSocket.on("idRoomConstruction", (idRoomConstruction: string) => {
						console.log("idRoomConstruction: ", idRoomConstruction);
						console.log("propsContext.props.startPlay: ", propsContext.props.startPlay);
						if (!propsContext.props.startPlay) {
							propsContext.props.endGame = false;
							propsContext.props.startPlay = true;

							game = new Game(getSocket, getProps, getCanvas, getDataPlayer);
							game.room = idRoomConstruction;
							game.run();

							console.log("game.room: ", game.room);
						}
					});

					webSocket.on("idRoomDestruction", (idRoomDestruction: string) => {
						console.log("idRoomDestruction: ", idRoomDestruction);
						console.log("propsContext.props.startPlay: ", propsContext.props.startPlay);
						if (propsContext.props.startPlay) {
							propsContext.props.endGame = true;
							propsContext.props.startPlay = false;

							game.stop();
						}
					});

					webSocket.on("youWin", (data: any) => {
						console.log("youWin: ", data);
						if (!propsContext.props.endGame) {
							propsContext.props.endGame = true;
							game.win();
						}
					});

					webSocket.on("youLose", (data: any) => {
						console.log("youLose: ", data);
						console.log("propsContext.props.endGame: ", propsContext.props.endGame);
						if (!propsContext.props.endGame) {
							propsContext.props.endGame = true;
							game.lose();
						}
					});

					webSocket.on("dataPlayer", (data: any) => {
						console.log("dataPlayer: ", data);
						dataPlayer = data;
					});
				};

				initialization();
			} catch (error) {
				console.error(error);
			}
		}

		SocketService();

		return (() => {
			console.log("RootLayout unmount");
			if (propsContext.props.startPlay) {
				propsContext.props.endGame = true;
				propsContext.props.startPlay = false;

				game.stop();
				console.log(" game.stop()");
			}
		})

	}, [propsContext, webSocketContext, canvasContext]);

	return (
		<div className="div"> {children} </div>
	)
}
