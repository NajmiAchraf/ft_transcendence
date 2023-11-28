'use client';

import { usePropsContext } from '@/app/context/PropsContext';
import { useWebSocketContext } from '@/app/context/WebSocketContext';

import { Props } from '@/app/(game)/ping-pong/common/Common';
import { useState } from 'react';

function SettingPingPong() {
	const propsContext = usePropsContext();
	const webContext = useWebSocketContext();

	const [isButtonClicked, setButtonClicked] = useState(false);


	const setMode = () => {
		propsContext.setProps({
			...propsContext.props,
			mode: propsContext.props.mode === "easy" ? "medium" : propsContext.props.mode === "medium" ? "hard" : "easy"
		} as Props);
	}

	const setMirror = () => {
		propsContext.setProps({
			...propsContext.props,
			mirror: !propsContext.props.mirror
		} as Props);
	}

	const setGeometry = () => {
		propsContext.setProps({
			...propsContext.props,
			geometry: propsContext.props.geometry === "cube" ? "sphere" : "cube"
		} as Props);
	}

	const joinGame = () => {
		console.log("joinGame");

		webContext.game.emit("joinGame", {
			playerType: propsContext.props.playerType,
			mode: propsContext.props.mode,
		});

		setButtonClicked(true);
	};

	const invitePlayer = () => {
		console.log("invitePlayer");

		webContext.game.emit("invitePlayer", {
			playerId: "playerId",
		});

		setButtonClicked(true);
	}

	return (
		<div className="Settings" id="Settings">
			{propsContext.props.playerType === "bot" && (
				/* change mode three modes easy medium hard */
				<button id="Button" onClick={setMode}>Mode {propsContext.props.mode}</button>
			)}

			{/* change mirror on(true) off(false) */}
			<button id="Button" onClick={setMirror}>Mirror {propsContext.props.mirror ? "on" : "off"}</button>

			{/* change geometry cube(sphere) */}
			<button id="Button" onClick={setGeometry}>Geometry {propsContext.props.geometry}</button>

			{!propsContext.props.invite ? (
				/* join game */
				<button id="Button" onClick={joinGame} disabled={isButtonClicked}>Join Game</button>
			) : (
				/* start game */
				<button id="Button" onClick={invitePlayer} disabled={isButtonClicked}>Confirme Invitation</button>
			)
			}
		</div >
	);
}

export default SettingPingPong;
