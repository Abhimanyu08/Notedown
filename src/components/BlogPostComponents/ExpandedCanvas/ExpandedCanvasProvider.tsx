"use client";
import React, { createContext, useState } from "react";
import ExpandedCanvasDisplay from "./ExpandedCanvasDisplay";

export const ExpandedCanvasContext = createContext<{
	setPersistanceKey?: React.Dispatch<React.SetStateAction<string>>;
}>({});

function ExpandedCanvasProvider({ children }: { children: React.ReactNode }) {
	const [persistanceKey, setPersistanceKey] = useState("");
	return (
		<ExpandedCanvasContext.Provider value={{ setPersistanceKey }}>
			<ExpandedCanvasDisplay {...{ persistanceKey, setPersistanceKey }} />
			{children}
		</ExpandedCanvasContext.Provider>
	);
}

export default ExpandedCanvasProvider;
