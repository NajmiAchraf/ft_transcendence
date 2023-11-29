'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { Props } from "../common/Common";

export interface IPropsContext {
	props: Props;
	setProps: React.Dispatch<React.SetStateAction<Props>>;
}

//create context
const PropsContext = createContext<IPropsContext | undefined>(undefined);

// use context
export function usePropsContext() {
	const context = useContext(PropsContext);

	if (context === undefined) {
		throw new Error("Props context not defined");
	}

	return context;
}

// default props
export function getDefaultProps(): Props {

	const defaultProps: Props = {
		geometry: "cube",
		mirror: false,
		mode: "medium",
		playerType: "player",
		invite: false,
		readyPlay: false,
		startPlay: false,
		inGame: false,
		endGame: false,
	};

	return defaultProps;
}

// context provider
function PropsContextProvider({ children }: { children: React.ReactNode }) {
	const [props, setProps] = useState<Props>({
		geometry: "cube",
		mirror: false,
		mode: "medium",
		playerType: "player",
		invite: false,
		readyPlay: false,
		startPlay: false,
		inGame: false,
		endGame: false,
	});

	const contextValue: IPropsContext = {
		props,
		setProps,
	};

	return (
		<PropsContext.Provider value={contextValue}>
			{children}
		</PropsContext.Provider>
	);
}

export default PropsContextProvider;
