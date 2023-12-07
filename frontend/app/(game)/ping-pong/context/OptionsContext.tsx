'use client';

import { createContext, useContext, useState } from "react";
import { Options } from "@/app/(game)/ping-pong/common/Common";

export interface IOptionsContext {
	options: Options;
	setOptions: React.Dispatch<React.SetStateAction<Options>>;
}

//create context
const OptionsContext = createContext<IOptionsContext | undefined>(undefined);

// use context
export function useOptionsContext() {
	const context = useContext(OptionsContext);

	if (context === undefined) {
		throw new Error("Options context not defined");
	}

	return context;
}

// default options
export function getDefaultOptions(): Options {

	const defaultOptions: Options = {
		invite: false,
		readyPlay: false,
		startPlay: false,
		inGame: false,
		endGame: false,
	};

	return defaultOptions;
}

// context provider
function OptionsContextProvider({ children }: { children: React.ReactNode }) {
	const [options, setOptions] = useState<Options>({
		invite: false,
		readyPlay: false,
		startPlay: false,
		inGame: false,
		endGame: false,
	});

	const contextValue: IOptionsContext = {
		options,
		setOptions,
	};

	return (
		<OptionsContext.Provider value={contextValue}>
			{children}
		</OptionsContext.Provider>
	);
}

export default OptionsContextProvider;
