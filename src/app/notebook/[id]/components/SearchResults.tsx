"use client";
import { Database } from "@/interfaces/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { postToDraft } from "@utils/postToDraft";
import { useParams, useSearchParams } from "next/navigation";
import React, { use } from "react";
import DraftSearch from "./DraftSearch";
import PostDisplay from "@components/PostComponents/PostDisplay";
import { createSupabaseBrowserClient } from "@utils/createSupabaseClients";

function SearchResults() {
	const searchParams = useSearchParams();
	const params = useParams();

	const query = searchParams?.get("q");

	if (!query) return <></>;
	const supabase = createSupabaseBrowserClient();
	const searchResults = use(
		getSearchResults(params?.id! as string, query, supabase)
	);
	if (!searchResults) return <p>No results returned for query: {query}</p>;
	return (
		<div className="absolute w-full h-full z-[100] bg-black">
			<div className="flex flex-col gap-4 px-2">
				<PostDisplay posts={searchResults} />
				<DraftSearch query={query} />
			</div>
		</div>
	);
}

async function getSearchResults(
	userId: string,
	searchQuery: string,
	supabase: SupabaseClient<Database>
) {
	// await new Promise((res) => setTimeout(res, 5000));
	const searchFunction = "search";
	const searchArgs = {
		user_id: userId,
		search_term: searchQuery,
	};

	const { data: searchResults } = await supabase.rpc(
		searchFunction,
		searchArgs
	);

	if (searchResults) {
		return searchResults.map((result) => postToDraft(result));
	}
	return null;
}

export default SearchResults;
