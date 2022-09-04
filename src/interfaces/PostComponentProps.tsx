import { Dispatch, SetStateAction } from "react";
import Post from "./Post";

export interface PostComponentProps {
	post: Partial<Post>;
	author?: string;
	owner: boolean;
	setPostInAction?: Dispatch<SetStateAction<Partial<Post> | null>>;
}
