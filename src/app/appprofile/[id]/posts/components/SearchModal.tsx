"use client";
import useSearch from "@/hooks/useSearch";
import useShortCut from "@/hooks/useShortcut";
import PostComponent from "@components/PostComponent";
import { useEffect, useRef, useState } from "react";

function SearchModal() {
	const [searchQuery, setSearchQuery] = useState("");
	const { searching, searchResults, searchError } = useSearch(searchQuery);
	const modalInputRef = useRef<HTMLInputElement | null>(null);
	const searchInputRef = useRef<HTMLInputElement | null>(null);

	useShortCut({
		keys: ["Alt", "k"],
		callback: () => {
			setSearchQuery("");
			if (modalInputRef.current) {
				modalInputRef.current.checked = !modalInputRef.current.checked;
			}
			if (searchInputRef.current) {
				searchInputRef.current.value = "";
				searchInputRef.current.focus();
			}
		},
		dependencyArray: [modalInputRef.current],
	});

	return (
		<>
			<input
				type="checkbox"
				name=""
				id="search"
				className="modal-input"
				ref={modalInputRef}
				onChange={(e) => {
					if (e.target.checked) {
						if (searchInputRef.current) {
							searchInputRef.current.value = "";
							searchInputRef.current.focus();
						}
					}
				}}
			/>
			<label
				htmlFor="search"
				className="modal-box backdrop-blur-sm"
				onClick={() => setSearchQuery("")}
			>
				<label htmlFor="" className="w-1/2 h-4/5 flex flex-col gap-5">
					<input
						type="text"
						name=""
						id="search-input"
						className="w-full bg-black p-2 rounded-md border-[1px] text-white border-gray-500"
						placeholder="Search..."
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								if (!searching)
									setSearchQuery(e.currentTarget.value);
							}
						}}
						ref={searchInputRef}
					/>
					{searchResults.length > 0 && (
						<div className="flex flex-col gap-8 flex-initial overflow-y-auto bg-black p-4 rounded-sm border-[1px] border-gray-500">
							{searchResults.map((post) => (
								<PostComponent key={post.id} post={post} />
							))}
						</div>
					)}
					{searchError && (
						<p className="text-white bg-black p-4 rounded-sm border-[1px] border-gray-500">
							{searchError.message}
						</p>
					)}
				</label>
			</label>
		</>
	);
}

export default SearchModal;
