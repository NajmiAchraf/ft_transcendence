'use client';

import { useEffect } from 'react';

import Game from '@/app/(game)/ping-pong/game/Game';

import { GameStates, PlayStates } from '@/app/(game)/ping-pong/common/Common';

import { useCanvasContext } from '@/app/(game)/ping-pong/context/CanvasContext';
import { usePropsContext } from '@/app/(game)/ping-pong/context/PropsContext';
import { useWebSocketContext } from '@/app/(game)/ping-pong/context/WebSocketContext';

function Service(setGameState: (setGameState: GameStates) => void): void {
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
		propsContext.props.player1Name = data.player1Name;
		propsContext.props.player2Name = data.player2Name;
	};

	const handleAllowToPlay = (data: any) => {
		setGameState("play");
		console.log('allowToPlay: ', data);
	};

	const handleAllowToWait = (data: any) => {
		setGameState("wait");
		console.log('allowToWait: ', data);
	};

	const handleDenyToPlay = (data: any) => {
		setGameState("settings");
		console.log('denyToPlay: ', data);
	};

	const handleError = (data: any) => {
		console.log('error: ', data.error);
	}

	const handleLeaveRoom = (data: any) => {
		stopGame();
		setGameState("settings");
		console.log('leaveRoom: ', data);
	};

	const handleLeaveQueue = (data: any) => {
		setGameState("settings");
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
		webSocketGame.on('allowToWait', handleAllowToWait);
		webSocketGame.on('denyToPlay', handleDenyToPlay);
		webSocketGame.on('error', handleError);
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
			webSocketGame.off('error', handleError);
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
