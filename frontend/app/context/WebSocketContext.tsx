'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

export interface IWebSocketContext {
	// chat: Socket<DefaultEventsMap, DefaultEventsMap>;
	// setChat: React.Dispatch<React.SetStateAction<Socket<DefaultEventsMap, DefaultEventsMap>>>;
	game: Socket<DefaultEventsMap, DefaultEventsMap>;
	setGame: React.Dispatch<React.SetStateAction<Socket<DefaultEventsMap, DefaultEventsMap>>>;
}

//create context
const WebSocketContext = createContext<IWebSocketContext | undefined>(undefined);

function useWebSocketContext() {
	const context = useContext(WebSocketContext);

	if (context === undefined) {
		throw new Error('WebSocket context not defined');
	}

	return context;
}

function WebSocketContextProvider({ children }: { children: React.ReactNode }) {

	// const chat = io('http://localhost:3001/chat', {
	// 	transports: ['websocket'],
	// 	query: {
	// 		// accessToken: localStorage.getItem('accessToken'),
	// 		accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoidXNyYXNkZmFzZGYiLCJpYXQiOjE3MDA1MDI5NjUsImV4cCI6MTcwMDUwNjU2NX0.5urxB2V-1FAm40cmCgjQJxoQW5XWxD-eyrtoA02ZCVQ',
	// 	}
	// });

	const game = io('http://localhost:3001', {
		transports: ['websocket'],
		query: {
			// accessToken: localStorage.getItem('accessToken'),
			accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYW5ham1pIiwiaWF0IjoxNzAwNzMxOTg1LCJleHAiOjE3MDA4MTgzODV9.7ba31sa8j_cd7Vtd-AfjHTcTRLR0iOrmHByjsIKl4tM',
		}
	});

	// const [socketChat, setsocketChat] = useState<Socket<DefaultEventsMap, DefaultEventsMap>>(chat);
	const [socketGame, setsocketGame] = useState<Socket<DefaultEventsMap, DefaultEventsMap>>(game);

	// useEffect(() => {

	// 	chat.on('connect', () => {
	// 		console.log(chat.id, ' Connected to namespace: /chat');
	// 	});

	// 	game.on('connect', () => {
	// 		console.log(game.id, ' Connected to namespace: /ping-pong');
	// 	});

	// 	return () => {
	// 		// Clean up the game connection when the component unmounts
	// 		console.log('disconnect from namespace: /chat and /ping-pong');
	// 		game.disconnect();
	// 		chat.disconnect();
	// 	};

	// }, [game, chat]);

	const contextValue: IWebSocketContext = {
		// chat: socketChat,
		// setChat: setsocketChat,
		game: socketGame,
		setGame: setsocketGame,
	};

	return (
		<WebSocketContext.Provider value={contextValue}>
			{children}
		</WebSocketContext.Provider>
	);
}

export {
	useWebSocketContext,
	WebSocketContextProvider
};
