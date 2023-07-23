"use client";
import React, { createContext, useState } from "react";
import ExpandedImageDisplay from "./ExpandedImageDisplay";

export const ExpandedImageContext = createContext<{
	setImageUrl?: React.Dispatch<React.SetStateAction<string>>;
}>({});

function ExpandedImageProvider({ children }: { children: React.ReactNode }) {
	const [imageUrl, setImageUrl] = useState("");
	return (
		<ExpandedImageContext.Provider value={{ setImageUrl }}>
			<ExpandedImageDisplay {...{ imageUrl, setImageUrl }} />
			{children}
		</ExpandedImageContext.Provider>
	);
}

export default ExpandedImageProvider;
