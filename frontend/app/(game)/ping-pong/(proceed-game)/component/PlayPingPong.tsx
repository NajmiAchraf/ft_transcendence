'use client';

import { useRef, useEffect, useState } from 'react'
import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

import { usePropsContext } from '@/app/context/PropsContext';
import { useWebSocketContext } from '@/app/context/WebSocketContext';
import { useCanvasContext } from '@/app/context/CanvasContext';

import { Text } from '@/app/(game)/ping-pong/game/Board';

function PlayPingPong() {
	const canvasContext = useCanvasContext();
	const propsContext = usePropsContext();
	const webContext = useWebSocketContext();

	const canvasRef = useRef<HTMLCanvasElement>(null);

	const startTime = useRef<number>(Date.now());
	const [currentTime, setCurrentTime] = useState<string>("--:--");

	useEffect(() => {
		async function Start() {
			await Text.loadFont();

			canvasContext.canvas = canvasRef.current;
			if (!canvasContext.canvas || !canvasRef.current) {
				throw new Error("Canvas not defined");
			}
			webContext.game.emit("readyCanvas");
		}

		Start();
		return () => {
			console.log("PlayPingPong unmount");
			// reset canvas
			canvasContext.setCanvas(null);
		};
	}, []);

	const interval = setInterval(() => {
		if (propsContext.props.startPlay) {
			const time = (Date.now() - startTime.current) / 1000;
			const min = Math.floor(time / 60);
			const sec = Math.floor(time % 60);
			setCurrentTime(`${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`);
		}

		if (propsContext.props.endGame) {
			clearInterval(interval);
		}
	}, 1000 / 60);

	const leaveGame = () => {
		console.log(Date.now() - startTime.current);
		if (propsContext.props.startPlay) {
			// if (Date.now() - startTime.current > 4000) {
			console.log('leaveGame');
			webContext.game.emit("leaveGame");
		}
	};

	const leavePair = () => {
		if (propsContext.props.playerType === "player") {
			console.log('leavePair');
			webContext.game.emit("leavePair");
		}
	};

	return (
		<div className="Parent" id="Parent">
			<canvas ref={canvasRef} id="PingPong"></canvas>
			<div className="section1">
				<div className="player p-right">
					<img src="/img3.png" alt="player-right" />
				</div>
				<div className="player p-left game-font">
					<h3>Smyto</h3>
				</div>
				<div className="mid-sec game-font">
					<h3>{currentTime}</h3>
				</div>
				<div className="player p-right game-font">
					<h3 >Smyto0000000000</h3>
				</div>
				<div className="player p-left">
					<img src="/img3.png" alt="player-left" />
				</div>
			</div>
			<div className='section2'>
				<div className='center-sec'>
					{!propsContext.props.startPlay && (
						<div className="waiting">
							<h3>Wait</h3>
						</div>
					)}
				</div>
			</div>

			<div className="section3">
				{propsContext.props.startPlay ? (
					<IonIcon icon={IonIcons.logOutOutline} onClick={leaveGame} />
				) : (
					<IonIcon icon={IonIcons.logOutOutline} onClick={leavePair} />
				)}
			</div>
		</div >
	);
}

export default PlayPingPong;
