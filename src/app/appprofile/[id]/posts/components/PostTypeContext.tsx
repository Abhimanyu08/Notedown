"use client";
import { PostTypes } from "@/interfaces/PostTypes";
import { ALLOWED_LANGUAGES } from "@utils/constants";
import React, { useState } from "react";
import { createContext } from "react";

export type PostTypeTogglerProps = {
	[k in PostTypes]: React.ReactNode;
};

export const PostTypeContext = createContext<{
	postType: PostTypes;
	setPostType: React.Dispatch<React.SetStateAction<PostTypes>>;
	searchResults: SearchResult[];
	setSearchResults: React.Dispatch<React.SetStateAction<SearchResult[]>>;
}>({
	postType: "latest",
	setPostType: () => "latest",
	searchResults: [],
	setSearchResults: () => [],
});

function PostTypeContextProvider({ children }: { children: React.ReactNode }) {
	const [postType, setPostType] = useState<PostTypes>("latest");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	return (
		<PostTypeContext.Provider
			value={{
				postType,
				setPostType,
				searchResults,
				setSearchResults,
			}}
		>
			{children}
		</PostTypeContext.Provider>
	);
}

type SearchResult = {
	id: number;
	created_by: string;
	title: string;
	description: string;
	published: boolean;
	created_at: string;
	published_on: string;
	language: (typeof ALLOWED_LANGUAGES)[number] | null | undefined;
	upvote_count: number;
	author: string;
	search_rank: number;
};

export default PostTypeContextProvider;
