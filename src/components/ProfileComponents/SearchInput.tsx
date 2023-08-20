"use client";
import { Input } from "@components/ui/input";
import { useContext, useRef } from "react";
import { SearchContext } from "./SearchProvider";
import { cn } from "@/lib/utils";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { AiFillCloseCircle } from "react-icons/ai";

function SearchInput({ className }: { className?: string }) {
	const { setSearchQuery, searchMeta } = useContext(SearchContext);
	const inputRef = useRef<HTMLInputElement>(null);
	return (
		<>
			<div className={cn(className, "flex gap-2")}>
				<Input
					placeholder="Search"
					className={"peer focus-visible:ring-0 h-full"}
					onKeyDown={(e) => {
						if (!setSearchQuery) return;
						if (e.key === "Enter") {
							setSearchQuery(e.currentTarget.value);
						}
					}}
					ref={inputRef}
					onChange={(e) => {
						if (!setSearchQuery) return;
						if (e.currentTarget.value === "") {
							setSearchQuery("");
						}
					}}
				/>
				{((searchMeta?.searchResults.length || 0) > 0 ||
					searchMeta?.searchError ||
					(searchMeta?.draftSearchResults.length || 0) > 0) && (
					<ToolTipComponent
						tip="Clear search results"
						side="bottom"
						onClick={() => {
							if (setSearchQuery) setSearchQuery("");
							if (inputRef.current) inputRef.current.value = "";
						}}
					>
						<AiFillCloseCircle size={20} />
					</ToolTipComponent>
				)}
			</div>
			<span className="absolute right-0 top-[105%] text-xs text-gray-500 mr-2 hidden peer-focus:inline font-light">
				Press Enter to search
			</span>
		</>
	);
}

export default SearchInput;
