"use client";
import { SEARCH_PRIVATE, SEARCH_PUBLC } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import React, { useContext, useState } from "react";
import { PostTypeContext } from "./PostTypeContext";

function SearchComponent({ id }: { id: string }) {
	const [query, setQuery] = useState("");
	const { setSearchResults } = useContext(PostTypeContext);
	const search = async (query: string) => {
		const { data } = await supabase.rpc(SEARCH_PRIVATE, {
			user_id: id,
			search_term: query,
			cursor: null,
		});
		setSearchResults(data);
	};
	return (
		<input
			type="text"
			name=""
			id=""
			value={query}
			onChange={(e) => setQuery(e.currentTarget.value)}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					search(query);
				}
			}}
			className="w-full rounded-sm px-2 py-1 text-sm text-black"
			placeholder="Search Posts"
		/>
	);
}

export default SearchComponent;
