'use client';

import { ReactNode, useEffect } from 'react'

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
	const webSocket = useWebSocketContext().webSocket;

	let game: Game;
	let dataPlayer: any | undefined = undefined;

	useEffect(() => {
		async function SocketService() {
			try {
				await Text.loadFont();

				const stopGame = () => {
					game.stop();
				};

				const getSocket = () => {
					return webSocket;
				};

				const getDataPlayer = () => {
					return dataPlayer;
				};

				const initialization = () => {
					webSocket.on("connect", () => {
						console.log("Connected to namespace: /ping-pong");
					});

					webSocket.on("idRoomConstruction", (idRoomConstruction: string) => {
						console.log("idRoomConstruction: ", idRoomConstruction);

						if (!propsContext.props.startPlay) {
							propsContext.props.startPlay = true;

							game = new Game(getSocket, getDataPlayer, propsContext.props, canvasContext.canvas);
							game.room = idRoomConstruction;
							game.run();
						}

						console.log("game.room: ", game.room);
					});

					webSocket.on("idRoomDestruction", (idRoomDestruction: string) => {
						console.log("idRoomDestruction: ", idRoomDestruction);

						propsContext.props.startPlay = false;

						stopGame();
					});

					webSocket.on("youWin", (data: any) => {
						console.log("youWin: ", data);
						game.win();
					});

					webSocket.on("youLose", (data: any) => {
						console.log("youLose: ", data);
						game.lose();
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
	}, [propsContext.props, canvasContext.canvas]);

	return (
		<div className="div"> {children} </div>
	)
}
