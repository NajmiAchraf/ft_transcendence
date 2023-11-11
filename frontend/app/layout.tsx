'use client'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './vanillacss.css'
import { WebSocketContextProvider } from './context/WebSocketContext'
import React from 'react'
const inter = Inter({ subsets: ['latin'] })

/* export const metadata: Metadata = {
  title: 'PingPong',
  description: 'PingPong',
} */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <React.StrictMode>
          <WebSocketContextProvider>
            {children}
          </WebSocketContextProvider>
        </React.StrictMode>
      </body>
    </html>
  )
}
