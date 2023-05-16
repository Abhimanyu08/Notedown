"use client";
import { Database } from "@/interfaces/supabase";
import React, { useEffect, useState } from "react";
import PostComponent from "./PostComponent";
import { supabase } from "@utils/supabaseClient";
import PostWithBlogger from "@/interfaces/PostWithBlogger";
import postTypeToFetcher from "@/app/utils/postTypeToFetcher";
import { PostTypes } from "@/interfaces/PostTypes";

function Paginator({
	postType,
	lastPost,
	cursorKey,
}: {
	postType: PostTypes;
	lastPost: PostWithBlogger;
	cursorKey: keyof PostWithBlogger;
}) {
	const [newPosts, setNewPosts] = useState<PostWithBlogger[]>([]);
	const [currentLastPost, setCurrentLastPost] =
		useState<PostWithBlogger>(lastPost);
	const extraPostFetcher = postTypeToFetcher[postType];
	const onLoadMore = () => {
		if (!extraPostFetcher) return;
		extraPostFetcher(currentLastPost, cursorKey).then((val) => {
			if (!val) return;
			setNewPosts((prev) => [...prev, ...val]);
			let last = val.at(val.length - 1);
			if (last) setCurrentLastPost(last);
		});
	};
	return (
		<div className="flex flex-col gap-8">
			{newPosts?.map((post, idx) => (
				<PostComponent key={idx} post={post} />
			))}
			<button
				className="text-xs bg-gray-800 hover:scale-105 active:scale-95  px-3 my-5 py-1 rounded-md w-fit mx-auto"
				onClick={onLoadMore}
			>
				Load more
			</button>
		</div>
	);
}

export default Paginator;
