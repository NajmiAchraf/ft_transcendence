'use client';

import { ReactNode } from 'react'


import PropsContextProvider from '@/app/context/PropsContext'
import CanvasContextProvider from '@/app/context/CanvasContext'
import { WebSocketContextProvider } from '@/app/context/WebSocketContext'

import '@/app/(game)/ping-pong.css'

export default function RootLayout({
	children,
}: {
	children: ReactNode
}) {
	/*
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

					webSocketGame.on("idRoomConstruction", (idRoomConstruction: string) => {
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

					webSocketGame.on("idRoomDestruction", (idRoomDestruction: string) => {
						console.log("idRoomDestruction: ", idRoomDestruction);
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
						propsContext.setProps({
							...propsContext.props,
							inGame: true
						} as Props);

						console.log("allowToPlay: ", data);
					});

					webSocketGame.on("denyToPlay", (data: any) => {

						propsContext.setProps({
							...propsContext.props,
							inGame: false
						} as Props);

						console.log("denyToPlay: ", data);
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
	*/

	return (
		<WebSocketContextProvider>
			<PropsContextProvider>
				<CanvasContextProvider>
					<h1>HELLLLLO</h1>
					<div className="div"> {children} </div>
				</CanvasContextProvider>
			</PropsContextProvider>
		</WebSocketContextProvider>
	)
}