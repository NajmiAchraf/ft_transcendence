import React from 'react'

import './globals.css'
import './vanillacss.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'PingPong',
	description: 'PingPong',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<React.StrictMode>
			<html lang="en">
				<body className={inter.className}> {children} </body>
			</html>
		</React.StrictMode>
	)
}
