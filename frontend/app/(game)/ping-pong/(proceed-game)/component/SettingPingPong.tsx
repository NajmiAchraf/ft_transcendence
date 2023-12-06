'use client';

import { usePropsContext } from '@/app/(game)/ping-pong/context/PropsContext';
import { useWebSocketContext } from '@/app/(game)/ping-pong/context/WebSocketContext';

import { useState } from 'react';

function SettingPingPong() {
	const propsContext = usePropsContext();
	const webContext = useWebSocketContext();

	const [isButtonClicked, setButtonClicked] = useState(false);

	const [devMode, setDevMode] = useState(propsContext.props.devMode);
	const [mode, setMode] = useState(propsContext.props.mode);
	const [mirror, setMirror] = useState(propsContext.props.mirror);
	const [geometry, setGeometry] = useState(propsContext.props.geometry);


	const changeDevMode = () => {
		propsContext.props.devMode = !propsContext.props.devMode
		setDevMode(propsContext.props.devMode)
	}

	const changeMode = () => {
		if (propsContext.props.mode === "easy") {
			propsContext.props.mode = "medium";
		} else if (propsContext.props.mode === "medium") {
			propsContext.props.mode = "hard";
		} else {
			propsContext.props.mode = "easy";
		}
		setMode(propsContext.props.mode)
	}

	const changeMirror = () => {
		propsContext.props.mirror = !propsContext.props.mirror
		setMirror(propsContext.props.mirror)
	}

	const changeGeometry = () => {
		propsContext.props.geometry = propsContext.props.geometry === "cube" ? "sphere" : "cube"
		setGeometry(propsContext.props.geometry)
	}

	const joinGame = () => {
		console.log("joinGame");

		webContext.socketGame.emit("joinGame", {
			playerType: propsContext.props.playerType,
			mode: propsContext.props.mode,
		});

		setButtonClicked(true);
	};

	const invitePlayer = () => {
		console.log("invitePlayer");

		webContext.socketGame.emit("invitePlayer", {
			playerId: "playerId",
		});

		setButtonClicked(true);
	}

	return (
		<div className="Settings" id="Settings">
			{/* change dev mode on(true) off(false) */}
			<button id="Button" onClick={changeDevMode}>DevMode {devMode ? "on" : "off"}</button>

			{propsContext.props.playerType === "bot" && (
				/* change mode three modes easy medium hard */
				<button id="Button" onClick={changeMode}>Mode {mode}</button>
			)}

			{/* change mirror on(true) off(false) */}
			<button id="Button" onClick={changeMirror}>Mirror {mirror ? "on" : "off"}</button>

			{/* change geometry cube(sphere) */}
			<button id="Button" onClick={changeGeometry}>Geometry {geometry}</button>

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
