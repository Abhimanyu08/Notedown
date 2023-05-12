import Post from "@/interfaces/Post";
import PostWithBlogger from "@/interfaces/PostWithBlogger";
import React, { createContext, useState } from "react";

export const PostContext = createContext<{
	homePosts: Partial<PostWithBlogger>[];
	setHomePosts: React.Dispatch<
		React.SetStateAction<Partial<PostWithBlogger>[]>
	>;

	latestPosts: Partial<Post>[];
	setLatestPosts: React.Dispatch<React.SetStateAction<Partial<Post>[]>>;

	greatestPosts: Partial<Post>[];
	setGreatestPosts: React.Dispatch<React.SetStateAction<Partial<Post>[]>>;

	privatePosts: Partial<Post>[];
	setPrivatePosts: React.Dispatch<React.SetStateAction<Partial<Post>[]>>;
}>({} as any);

function PostContextComponent({ children }: { children: JSX.Element[] }) {
	const [homePosts, setHomePosts] = useState<Partial<PostWithBlogger>[]>([]);
	const [latestPosts, setLatestPosts] = useState<Partial<Partial<Post>>[]>(
		[]
	);
	const [greatestPosts, setGreatestPosts] = useState<
		Partial<Partial<Post>>[]
	>([]);
	const [privatePosts, setPrivatePosts] = useState<Partial<Partial<Post>>[]>(
		[]
	);

	return (
		<PostContext.Provider
			value={{
				homePosts,
				setHomePosts,
				latestPosts,
				setLatestPosts,
				greatestPosts,
				setGreatestPosts,
				privatePosts,
				setPrivatePosts,
			}}
		>
			{children}
		</PostContext.Provider>
	);
}

export default PostContextComponent;
