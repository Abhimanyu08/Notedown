"use client";
import { SEARCH_PRIVATE, SEARCH_PUBLC } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import React, { useContext, useState } from "react";
import { PostTypeContext } from "./PostTypeContext";
import { AiOutlineEnter } from "react-icons/ai";

function SearchComponent({ id }: { id: string }) {
	const [query, setQuery] = useState("");
	const { searchResults, setSearchResults } = useContext(PostTypeContext);
	const search = async (query: string) => {
		const { data, error } = await supabase.rpc(SEARCH_PRIVATE, {
			user_id: id,
			search_term: query,
			cursor: 1,
		});
		if (!data || data.length === 0 || error) setSearchResults([]);
		setSearchResults(data || []);
	};
	return (
		<div className="relative hover:absolute top-0 left-0 w-full">
			<input
				type="text"
				name=""
				id=""
				value={query}
				onChange={(e) => setQuery(e.currentTarget.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						search(query.trim().split(" ").join(" | "));
					}
					if (e.key === "Escape") {
						setQuery("");
						setSearchResults([]);
					}
				}}
				className="w-full rounded-sm px-2 py-1 text-sm text-black"
				placeholder="Search Posts"
			/>
			<div className="absolute text-xs  right-1 top-[1.2px]">
				{query && searchResults.length === 0 && (
					<button className="px-3 py-1 hover:italic active:scale-95 bg-gray-800">
						Press <AiOutlineEnter />
					</button>
				)}
				{searchResults.length > 0 && (
					<button className="px-3 py-1 hover:italic active:scale-95 bg-gray-800">
						Press Esc to clear
					</button>
				)}
			</div>
		</div>
	);
}

export default SearchComponent;
