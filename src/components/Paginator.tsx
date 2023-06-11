"use client";
import { useSupabase } from "@/app/appContext";
import postTypeToFetcher from "@/app/utils/postTypeToFetcher";
import { PostTypes } from "@/interfaces/PostTypes";
import PostWithBlogger from "@/interfaces/PostWithBlogger";
import { useState } from "react";
import PostComponent from "./PostComponent";
import UpvoteWithPost from "@/interfaces/Upvotes";

function Paginator({
	postType,
	lastPost,
	cursorKey,
}: {
	postType: PostTypes;
	lastPost: PostWithBlogger | UpvoteWithPost;
	cursorKey: keyof PostWithBlogger;
}) {
	const { supabase } = useSupabase();
	const [newPosts, setNewPosts] = useState<PostWithBlogger[]>([]);
	const [currentLastPost, setCurrentLastPost] = useState(lastPost);
	const [hasMorePosts, setHasMorePosts] = useState(true);
	const extraPostFetcher = postTypeToFetcher[postType];
	const onLoadMore = () => {
		if (!extraPostFetcher) return;
		extraPostFetcher(currentLastPost, cursorKey, supabase).then((val) => {
			if (!val) return;
			let { data, hasMore } = val;
			setHasMorePosts(hasMore);
			let last = data?.at(-1);
			if (last) setCurrentLastPost(last);
			if (postType === "upvoted") data = data.map((p) => p.posts);
			setNewPosts((prev) => [...prev, ...data!]);
		});
	};

	return (
		<div className="flex flex-col gap-8 mt-8">
			{newPosts?.map((post, idx) => (
				<PostComponent key={idx} post={post} />
			))}
			{hasMorePosts && (
				<button
					className="text-xs bg-gray-800 hover:scale-105 active:scale-95  px-3 my-5 py-1 rounded-sm w-fit mx-auto"
					onClick={onLoadMore}
				>
					Load more
				</button>
			)}
		</div>
	);
}

export default Paginator;
