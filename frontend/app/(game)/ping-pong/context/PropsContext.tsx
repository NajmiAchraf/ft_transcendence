'use client';

import { createContext, useContext, useState } from "react";
import { Props } from "@/app/(game)/ping-pong/common/Common";

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
		devMode: 'none',
		geometry: "cube",
		refraction: true,
		mode: "medium",
		playerType: "player",
		player1Name: "name",
		player2Name: "name",
	};

	return defaultProps;
}

// context provider
function PropsContextProvider({ children }: { children: React.ReactNode }) {
	const [props, setProps] = useState<Props>({
		devMode: 'none',
		geometry: "cube",
		refraction: true,
		mode: "medium",
		playerType: "player",
		player1Name: "name",
		player2Name: "name",
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
