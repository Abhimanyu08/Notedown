"use client";
import useSearch from "@/hooks/useSearch";
import React, {
	Dispatch,
	SetStateAction,
	createContext,
	useState,
} from "react";

export const SearchContext = createContext<{
	setSearchQuery?: Dispatch<SetStateAction<string>>;
	searchMeta?: ReturnType<typeof useSearch>;
}>({});

function SearchProvider({ children }: { children: React.ReactNode }) {
	const [searchQuery, setSearchQuery] = useState("");
	const searchMeta = useSearch(searchQuery);

	return (
		<SearchContext.Provider value={{ setSearchQuery, searchMeta }}>
			{children}
		</SearchContext.Provider>
	);
}

export default SearchProvider;
