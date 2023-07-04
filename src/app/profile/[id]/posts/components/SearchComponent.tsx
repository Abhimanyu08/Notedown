"use client";
import useSearch from "@/hooks/useSearch";
import PostComponent from "@components/PostComponent";
import { useState } from "react";
import { SinglePostLoading } from "./SinglePostLoading";

function SearchComponent({
	publishPostAction,
	unpublishPostAction,
	deletePostAction,
}: {
	publishPostAction?: (postId: number) => Promise<void>;
	unpublishPostAction?: (postId: number) => Promise<void>;
	deletePostAction?: (postId: number) => Promise<void>;
}) {
	const [searchQuery, setSearchQuery] = useState("");
	const { searching, searchResults, searchError } = useSearch(searchQuery);

	return (
		<div
			className={` absolute flex flex-col gap-4 top-0 left-0 w-full px-2 ${
				searchResults.length > 0 ? "h-full" : ""
			}`}
		>
			<input
				className="rounded-md transition-all duration-500 w-44 self-end focus:w-56 focus:outline-none focus:border-gray-300 items-center px-3 py-1 border-[1px] border-gray-500 text-sm text-gray-100 bg-black"
				placeholder="Search"
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						if (!searching) setSearchQuery(e.currentTarget.value);
					}
				}}
				onChange={(e) => {
					if (e.target.value === "") setSearchQuery("");
				}}
			/>
			{searching && (
				<div className="flex flex-col gap-10 bg-black z-50">
					{Array.from({ length: 4 }).map((_, i) => (
						<SinglePostLoading key={i} />
					))}
				</div>
			)}

			{searchError && (
				<p className="text-white bg-black p-4 rounded-sm border-[1px] border-gray-500">
					{searchError.message}
				</p>
			)}
			{searchResults.length > 0 && (
				<div className="flex flex-col gap-8 grow bg-black z-20">
					{searchResults.map((post) => (
						<PostComponent
							key={post.id}
							post={post}
							{...{
								publishPostAction,
								unpublishPostAction,
								deletePostAction,
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default SearchComponent;
