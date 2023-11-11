import { createContext, useContext, useState } from "react";
import { Props } from "../common/Common";

export interface IPropsContext {
	props: Props;
	setProps: React.Dispatch<React.SetStateAction<Props>>;
}

//create context
const PropsContext = createContext<IPropsContext | undefined>(undefined);

//use context
function usePropsContext() {

	const context = useContext(PropsContext)

	if (context === undefined) {
		throw new Error("context not defined");
	}

	return (context)
}

function PropsContextProvider({ children }: { children: any }) {

	const [props, setProps] = useState<Props>({
		canvas: null,
		geometry: "cube",
		mirror: false,
		mode: "medium",
		playerType: "player",
		inGame: false,
	} as Props);

	const contextValue: IPropsContext = {
		props,
		setProps
	}

	return (
		<PropsContext.Provider value={contextValue}>
			{children}
		</PropsContext.Provider>
	);
};

export {
	usePropsContext,
	PropsContextProvider
}
