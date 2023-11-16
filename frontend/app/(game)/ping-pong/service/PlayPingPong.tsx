'use client';

import { useRef, useEffect, useState } from 'react'
import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

// import SocketService from './SocketService';
import { usePropsContext } from '@/app/context/PropsContext';
import { useWebSocketContext } from '@/app/context/WebSocketContext';
import { useCanvasContext } from '@/app/context/CanvasContext';

import { Props } from '@/app/(game)/ping-pong/common/Common';

function PlayPingPong() {
	const canvasContext = useCanvasContext();
	const propsContext = usePropsContext();
	const webContext = useWebSocketContext();

	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		canvasContext.canvas = canvasRef.current;
		if (!canvasContext.canvas) {
			throw new Error("Canvas not defined");
		}
	}, []);

	const leaveGame = () => {
		console.log('leaveGame');

		webContext.webSocket.emit("leaveGame");

		propsContext.setProps({
			...propsContext.props,
			inGame: false
		} as Props);
	};

	return (
		<div className="Parent" id="Parent">
			<div className="section1">
				<div className="player p-left">
					<img src="/img3.png" />
					<h4>Smyto</h4>
				</div>
				<div className="mid-sec">
					<div className="game-timer">
						<h3>10:05</h3>
					</div>
					<IonIcon icon={IonIcons.logOutOutline} onClick={leaveGame} />
				</div>
				<div className="player p-right">
					<img src="/img3.png" />
					<h4>Smyto</h4>
				</div>
			</div>
			{/* {!propsContext.props.startPlay ? (
				<canvas ref={canvasContext.canvas.canvas as React.RefObject<HTMLCanvasElement> | undefined} id="PingPong"></canvas>
			) : (
				<div></div>
			)} */}
			<canvas ref={canvasRef} id="PingPong"></canvas>
		</div>
	);
}

export default PlayPingPong;
