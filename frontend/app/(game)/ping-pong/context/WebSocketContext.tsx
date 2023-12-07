'use client';

import { createContext, useContext, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

export interface IWebSocketContext {
	socketGame: Socket<DefaultEventsMap, DefaultEventsMap>;
	setSocketGame: React.Dispatch<React.SetStateAction<Socket<DefaultEventsMap, DefaultEventsMap>>>;
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
	const game = io('http://localhost:3001/ping-pong', {
		transports: ['websocket'],
		query: {
			// accessToken: localStorage.getItem('accessToken'),

			accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWNocmFmIiwiaWF0IjoxNzAxOTUxMDI4LCJleHAiOjE3MDIwMzc0Mjh9.Vz9oPv6wwA8cKXOOkV9qSlH394sniTw8ZqC5thuZBq0",
		}
	});

	const [socketGame, setSocketGame] = useState<Socket<DefaultEventsMap, DefaultEventsMap>>(game);

	const contextValue: IWebSocketContext = {
		socketGame: socketGame,
		setSocketGame: setSocketGame,
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
