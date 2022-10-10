import { Dispatch, SetStateAction } from "react";
import Post from "./Post";
import SearchResult from "./SearchResult";

export interface PostComponentProps {
	post: Partial<SearchResult>;
	author?: string;
	owner: boolean;
	setPostInAction?: Dispatch<SetStateAction<Partial<Post> | null>>;
}
