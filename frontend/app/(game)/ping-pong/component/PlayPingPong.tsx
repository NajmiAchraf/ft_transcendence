import { useRef, useEffect, useState } from 'react'

import SocketService from '../service/SocketService';

import { usePropsContext } from '../context/PropsContext';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { Props } from '../common/Common';

function PlayPingPong() {
	const webContext = useWebSocketContext();
	const propsContext = usePropsContext();

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const socSrv = useRef<SocketService>();

	const [endGame, setEndGame] = useState<boolean>(false);
	const [createGame, setCreateGame] = useState<boolean>(false);

	useEffect(() => {
		//! this is not working :: because it's inside of hook function useEffect :: no need to call a hook function inside of hook function useEffect
		// propsContext.setProps({
		// 	...propsContext.props,
		// 	canvas: canvasRef.current,
		// } as Props);
		//? why this is working
		propsContext.props.canvas = canvasRef.current;

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
		//! and this is working :: because it's outside of hook function useEffect
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
