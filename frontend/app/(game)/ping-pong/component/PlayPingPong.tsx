import { useRef, useEffect, useState } from 'react'

import SocketService from '../service/SocketService';

import { usePropsContext } from '../context/PropsContext';
import { useWebSocketContext } from '../../../context/WebSocketContext';
import { Props } from '../common/Common';
import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
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
			<div className="section1">
				<div className="player p-left">
					<img src="./img3.png"/>
					<h4>Smyto</h4>
				</div>
				<div className="mid-sec">
					<div className="game-timer">
						<h3>10:05</h3>
					</div>
					<IonIcon icon={IonIcons.logOutOutline} onClick={leaveGame} />
				</div>
				<div className="player p-right">
					<img src="./img3.png"/>
					<h4>Smyto</h4>
				</div>
			</div>
			{/*<button id="Button" onClick={leaveGame}>
				Leave Game
			</button>*/}
			<canvas ref={canvasRef} id="PingPong"></canvas>
			{/*
				endGame ? (
					<button id="Button" onClick={playAgain}> Play Again </button>
				) : (
					<div></div>
				)*/
			}
		</div>
	);
}

export default PlayPingPong;
