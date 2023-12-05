'use client';

import { createContext, useContext, useState } from "react";
import { Canvas } from "@/app/(game)/ping-pong/common/Common";

export interface ICanvasContext {
	canvas: Canvas;
	setCanvas: React.Dispatch<React.SetStateAction<Canvas>>;
}

//create context
const CanvasContext = createContext<ICanvasContext | undefined>(undefined);

// use context
export function useCanvasContext() {
	const context = useContext(CanvasContext);

	if (context === undefined) {
		throw new Error("Canvas context not defined");
	}

	return context;
}

// context provider
function CanvasContextProvider({ children }: { children: React.ReactNode }) {
	const [canvas, setCanvas] = useState<Canvas>(null);

	const contextValue: ICanvasContext = {
		canvas,
		setCanvas,
	};

	return (
		<CanvasContext.Provider value={contextValue}>
			{children}
		</CanvasContext.Provider>
	);
}

export default CanvasContextProvider;
