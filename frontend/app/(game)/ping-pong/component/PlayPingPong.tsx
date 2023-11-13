'use client';

import { useRef, useEffect, useState } from 'react'

import SocketService from '../service/SocketService';

import { usePropsContext } from '../context/PropsContext';
import { useWebSocketContext } from '../../../context/WebSocketContext';
import { Props } from '../common/Common';

function PlayPingPong() {
	const webContext = useWebSocketContext();
	const propsContext = usePropsContext();

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const socSrv = useRef<SocketService>();

	const [endGame, setEndGame] = useState<boolean>(false);
	const [createGame, setCreateGame] = useState<boolean>(false);

	useEffect(() => {
		propsContext.props.canvas = canvasRef.current;
		// console.log('webContext.webSocket.id: ', webContext.webSocket.id);
		function CreateGame() {
			try {
				if (propsContext.props.canvas) {
					socSrv.current = new SocketService(webContext.webSocket, propsContext.props, setEndGame);
				}
			} catch (error) {
				console.error(error);
			}
		}
		if (!createGame) {
			setCreateGame(true);
			CreateGame();
		}
	}, []);

	const leaveGame = () => {
		console.log('leaveGame0');

		socSrv.current?.leaveGame();

		setEndGame(false);

		propsContext.setProps({
			...propsContext.props,
			inGame: false
		} as Props);
	};

	const playAgain = () => {
		console.log('playAgain');

		socSrv.current?.stopGame();

		setEndGame(false);

		webContext.webSocket.emit("joinGame", {
			socketId: webContext.webSocket.id,
			playerType: propsContext.props.playerType,
			mode: propsContext.props.mode,
		});
	}

	return (
		<div className="Parent" id="Parent">
			<canvas ref={canvasRef} id="PingPong"></canvas>

			<button id="Button" onClick={leaveGame}>
				Leave Game
			</button>
			{
				endGame ? (
					<button id="Button" onClick={playAgain}> Play Again </button>
				) : (
					<div></div>
				)
			}
		</div>
	);
}

export default PlayPingPong;
