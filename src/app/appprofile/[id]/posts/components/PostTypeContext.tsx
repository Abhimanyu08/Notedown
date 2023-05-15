"use client";
import { PostTypes } from "@/interfaces/PostTypes";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { createContext } from "react";

export type PostTypeTogglerProps = {
	[k in PostTypes]: React.ReactNode;
};

export const PostTypeContext = createContext<{
	postType: PostTypes;
	setPostType: React.Dispatch<React.SetStateAction<PostTypes>>;
}>({
	postType: "latest",
	setPostType: () => "latest",
});

function PostTypeContextProvider({ children }: { children: React.ReactNode }) {
	const [postType, setPostType] = useState<PostTypes>("latest");

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
