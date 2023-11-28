import React from 'react'

import './globals.css'
import './vanillacss.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import NavContextProvider from './(NavbarPages)/context/NavContext'
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
		<html lang="en">
			<NavContextProvider>
				<body className={inter.className}> {children} </body>
			</NavContextProvider>
		</html>
	)
}
