'use client';

import { useEffect } from 'react';
import Game from '@/app/(game)/ping-pong/game/Game';
import { useCanvasContext } from '@/app/(game)/ping-pong/context/CanvasContext';
import { usePropsContext } from '@/app/(game)/ping-pong/context/PropsContext';
import { useWebSocketContext } from '@/app/(game)/ping-pong/context/WebSocketContext';
import '@/app/(game)/ping-pong.css';
import { PlayStates } from '../../common/Common';

function Service(setInGame: (inGame: boolean) => void): void {
	const canvasContext = useCanvasContext();
	const propsContext = usePropsContext();
	const webSocketContext = useWebSocketContext();
	const webSocketGame = webSocketContext.socketGame;

	let playState: PlayStates = "readyPlay";

	let game: Game;
	let dataPlayer: any | undefined = undefined;

	const updateGameStates = (readyPlay: boolean, startPlay: boolean, endGame: boolean) => {
		propsContext.props.readyPlay = readyPlay;
		propsContext.props.startPlay = startPlay;
		propsContext.props.endGame = endGame;
	};

	const initGame = () => {
		console.log('initGame => readyPlay: ', propsContext.props.readyPlay, ' apply: ', playState);
		if (playState === "readyPlay") {
			playState = "startPlay";

			updateGameStates(true, false, false);

			if (game) {
				game.stop();
			}
			game = new Game(
				() => webSocketContext.socketGame,
				() => propsContext.props,
				() => canvasContext.canvas,
				() => dataPlayer
			);

			console.log('game.room: ', game.room);
		}
	};

	const runGame = () => {
		console.log('runGame => startPlay: ', propsContext.props.startPlay, ' apply: ', playState);
		if (playState === "startPlay") {
			playState = "endPlay";

			updateGameStates(true, true, false);

			game.run();
		}
	};

	const stopGame = () => {
		console.log('stopGame => endGame: ', propsContext.props.endGame, ' apply: ', playState);
		if (playState === "endPlay") {
			playState = "readyPlay";

			updateGameStates(false, false, true);

			game.stop();
		}
	};

	const winOrLoseGame = (win: boolean) => {
		console.log("winOrLoseGame => endGame: ", propsContext.props.endGame);
		if (playState === "endPlay") {
			updateGameStates(true, true, true);

			win ? game.win() : game.lose();
		}
	};

	const handleConnect = () => {
		console.log('Connected to namespace: /ping-pong');
	};

	const handleDataPlayer = (data: any) => {
		console.log('dataPlayer: ', data);
		dataPlayer = data;
	};

	const handleAllowToPlay = (data: any) => {
		setInGame(true);
		console.log('allowToPlay: ', data);
	};

	const handleDenyToPlay = (data: any) => {
		setInGame(false);
		console.log('denyToPlay: ', data);
	};

	const handleLeaveRoom = (data: any) => {
		stopGame();
		setInGame(false);
		console.log('leaveRoom: ', data);
	};

	const handleLeaveQueue = (data: any) => {
		setInGame(false);
		console.log('leaveQueue: ', data);
	};

	const handleRoomConstruction = () => {
		initGame();
	};

	const handleStartPlay = (data: any) => {
		console.log('startPlay: ', data);
		runGame();
	};

	const handleRoomDestruction = (roomDestruction: string) => {
		console.log('roomDestruction: ', roomDestruction);
		stopGame();
	};

	const handleYouWin = (data: any) => {
		console.log('youWin: ', data);
		winOrLoseGame(true);
	};

	const handleYouLose = (data: any) => {
		console.log('youLose: ', data);
		winOrLoseGame(false);
	};

	useEffect(() => {
		webSocketGame.on('connect', handleConnect);
		webSocketGame.on('dataPlayer', handleDataPlayer);
		webSocketGame.on('allowToPlay', handleAllowToPlay);
		webSocketGame.on('denyToPlay', handleDenyToPlay);
		webSocketGame.on('leaveRoom', handleLeaveRoom);
		webSocketGame.on('leaveQueue', handleLeaveQueue);
		webSocketGame.on('roomConstruction', handleRoomConstruction);
		webSocketGame.on('startPlay', handleStartPlay);
		webSocketGame.on('roomDestruction', handleRoomDestruction);
		webSocketGame.on('youWin', handleYouWin);
		webSocketGame.on('youLose', handleYouLose);

		// Cleanup listeners on unmount
		return () => {
			console.log('Service unmount');
			webSocketGame.off('connect', handleConnect);
			webSocketGame.off('dataPlayer', handleDataPlayer);
			webSocketGame.off('allowToPlay', handleAllowToPlay);
			webSocketGame.off('denyToPlay', handleDenyToPlay);
			webSocketGame.off('leaveRoom', handleLeaveRoom);
			webSocketGame.off('leaveQueue', handleLeaveQueue);
			webSocketGame.off('roomConstruction', handleRoomConstruction);
			webSocketGame.off('startPlay', handleStartPlay);
			webSocketGame.off('roomDestruction', handleRoomDestruction);
			webSocketGame.off('youWin', handleYouWin);
			webSocketGame.off('youLose', handleYouLose);
		};
	}, [propsContext, canvasContext]);

	return;
}

export default Service;
