"use client";
import React, { useState } from "react";
import { createContext } from "react";

export const PostTypes = ["latest", "greatest", "private", "upvoted"] as const;
export type PostTypeTogglerProps = {
	[k in (typeof PostTypes)[number]]: React.ReactNode;
};

export const PostTypeContext = createContext<{
	postType: (typeof PostTypes)[number];
	setPostType: React.Dispatch<
		React.SetStateAction<(typeof PostTypes)[number]>
	>;
}>({
	postType: "latest",
	setPostType: () => "latest",
});

function PostTypeContextProvider({ children }: { children: React.ReactNode }) {
	const [postType, setPostType] =
		useState<(typeof PostTypes)[number]>("latest");

	return (
		<PostTypeContext.Provider
			value={{
				postType,
				setPostType,
			}}
		>
			{children}
		</PostTypeContext.Provider>
	);
}

export default PostTypeContextProvider;
