'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { useRouter } from 'next/navigation';
import { getCookie } from '../components/errorChecks';
export interface IWebSocketContext {
	chat: Socket<DefaultEventsMap, DefaultEventsMap>;
	setChat: React.Dispatch<React.SetStateAction<Socket<DefaultEventsMap, DefaultEventsMap>>>;
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
	const chat = io('http://localhost:3001/chat', {
		transports: ['websocket'],
		query: {
			accessToken: getCookie("AccessToken"),
		}
	});
	const [socketChat, setsocketChat] = useState<Socket<DefaultEventsMap, DefaultEventsMap>>(chat);

	const contextValue: IWebSocketContext = {
		chat: socketChat,
		setChat: setsocketChat,
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
