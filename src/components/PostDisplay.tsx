import React, {
	Dispatch,
	MouseEventHandler,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import { SUPABASE_POST_TABLE } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Post from "../interfaces/Post";
import { PostComponentProps } from "../interfaces/PostComponentProps";
import PostWithBlogger from "../interfaces/PostWithBlogger";
import PostComponent from "./PostComponent";

const LIMIT = 2;

interface PostDisplayProps {
	owner: boolean;
	author?: string;
	setPostInAction?: Dispatch<SetStateAction<Partial<Post> | null>>;
	posts?: Partial<PostWithBlogger>[] | null;
	cursorKey: keyof Post;
	ascending: boolean;
	addPosts: (newPosts: Post[] | PostWithBlogger[]) => void;
}

function checkPostType(
	post: PostWithBlogger | Partial<Post>
): post is PostWithBlogger {
	return Object.hasOwn(post, "bloggers");
}

function PostDisplay({
	ascending,
	posts,
	owner,
	author,
	cursorKey,
	setPostInAction,
	addPosts,
}: PostDisplayProps) {
	const [cursor, setCursor] = useState(
		(posts?.at(posts.length - 1) || {})[cursorKey] || null
	);

	useEffect(() => {
		setCursor((posts?.at(posts.length - 1) || {})[cursorKey] || null);
	}, [posts]);

	const onLoadMore: MouseEventHandler = async () => {
		if (!posts || posts.length === 0) return;

		if (author) {
			//posts are requested from a single user
			const created_by = posts.at(0)!.created_by!;
			const published = posts.at(0)!.published!;
			const { data, error } = await supabase
				.from<Post>(SUPABASE_POST_TABLE)
				.select()
				.match({ created_by, published })
				.order(cursorKey, { ascending })
				.lt(cursorKey, cursor)
				.limit(LIMIT);

			if (error || !data) {
				console.log(error.message || "data returned is null");
				return;
			}

			addPosts(data);
			return;
		}

		const { data, error } = await supabase
			.from<PostWithBlogger>(SUPABASE_POST_TABLE)
			.select("*, bloggers(name)")
			.order(cursorKey, { ascending })
			.lt(cursorKey, cursor)
			.limit(LIMIT);

		if (error || !data) {
			console.log(error.message || "data returned is null");
			return;
		}

		addPosts(data);
	};

	return (
		<div className="flex flex-col gap-8  mt-5 grow-1 overflow-y-auto">
			{posts?.map((post) => (
				<PostComponent
					key={post.id!}
					{...{
						post,
						author: author || post.bloggers?.name,
						owner,
						setPostInAction,
					}}
				/>
			))}
			<div className="flex justify-center pb-10">
				<div
					className="btn btn-sm normal-case bg-slate-800"
					onClick={onLoadMore}
				>
					Load More
				</div>
			</div>
		</div>
	);
}

export default PostDisplay;
