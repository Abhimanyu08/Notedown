"use client";
import { Database } from "@/interfaces/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { postToDraft } from "@utils/postToDraft";
import { useParams, useSearchParams } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import DraftSearch from "./DraftSearch";
import PostDisplay from "@components/PostComponents/PostDisplay";
import { createSupabaseBrowserClient } from "@utils/createSupabaseClients";
import PostsLoading from "../loading";

function SearchResults() {
	const searchParams = useSearchParams();
	const params = useParams();

	const query = searchParams?.get("q");
	const [searchResults, setSearchResults] = useState<Awaited<
		ReturnType<typeof getSearchResults>
	> | null>(null);
	const [searching, setSearching] = useState(false);

	useEffect(() => {
		if (!query) return;
		setSearching(true);
		getSearchResults(params?.id! as string, query).then((results) => {
			setSearchResults(results);
			setSearching(false);
		});
	}, [query]);

	if (!searchResults || !query) return <></>;

	if (searching) {
		return <PostsLoading />;
	}

	return (
		<div className="">
			<div className="flex flex-col gap-4 px-2">
				{searchResults.length > 0 && (
					<PostDisplay posts={searchResults} />
				)}
				<DraftSearch query={query} serverResults={searchResults} />
				<p className="hidden first:block px-2">
					<span className="text-gray-400">
						No results to show for query:
					</span>{" "}
					<span>{query}</span>
				</p>
			</div>
		</div>
	);
}

async function getSearchResults(userId: string, query: string) {
	const supabase = createSupabaseBrowserClient();
	const searchFunction = "search";
	let searchQuery = query.trim().split(" ").join(" | ");
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
	return [];
}

export default SearchResults;
