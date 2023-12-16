'use client';

import { ReactNode } from 'react'

import OptionsContextProvider from '@/app/(game)/ping-pong/context/OptionsContext'
import PropsContextProvider from '@/app/(game)/ping-pong/context/PropsContext'
import CanvasContextProvider from '@/app/(game)/ping-pong/context/CanvasContext'
import { WebSocketContextProvider } from '@/app/(game)/ping-pong/context/WebSocketContext'

import '@/app/(game)/ping-pong.css'

export default function RootLayout({
	children,
}: {
	children: ReactNode
}) {
	return (
		<WebSocketContextProvider>
			<PropsContextProvider>
				<OptionsContextProvider>
					<CanvasContextProvider>
						<div className="div"> {children} </div>
					</CanvasContextProvider>
				</OptionsContextProvider>
			</PropsContextProvider>
		</WebSocketContextProvider>
	)
}
