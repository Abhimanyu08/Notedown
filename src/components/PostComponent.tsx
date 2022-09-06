import Link from "next/link";
import { useRouter } from "next/router";
import { title } from "process";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { BiUpvote } from "react-icons/bi";
import { TbNews, TbNewsOff } from "react-icons/tb";
import { SUPABASE_POST_TABLE } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Post from "../interfaces/Post";
import { PostComponentProps } from "../interfaces/PostComponentProps";

const PostComponent: React.FC<PostComponentProps> = ({
	post,
	author,
	owner = false,
	setPostInAction,
}) => {
	const { id, title, description, created_by, published_on, published } =
		post;
	const router = useRouter();
	const [upvotes, setUpvotes] = useState<number | null>(null);
	const formatter = useRef(Intl.NumberFormat("en", { notation: "compact" }));

	useEffect(() => {
		const fetchUpvotes = async () => {
			const { data, error } = await supabase
				.from<Post>(SUPABASE_POST_TABLE)
				.select("upvote_count")
				.eq("id", id!);
			if (error || !data || data.length === 0) return;
			setUpvotes(data.at(0)?.upvote_count || 0);
		};

		if (upvotes === null && id) fetchUpvotes();
	}, []);

	const onAction: MouseEventHandler = () => {
		if (setPostInAction) setPostInAction(post);
	};
	return (
		<div className="text-white relative container">
			<Link href={published ? `/posts/${id}` : `/posts/preview/${id}`}>
				<div className="text-xl font-normal link link-hover truncate w-3/4">
					{title}{" "}
				</div>
			</Link>
			{owner && (
				<div className="flex absolute top-0 right-0 gap-2">
					<label
						htmlFor={`edit`}
						className="btn btn-xs btn-circle btn-ghost  tooltip tooltip-left capitalize"
						data-tip="edit"
						onClick={onAction}
					>
						<AiFillEdit
							className="ml-1 mt-1 text-white"
							size={15}
						/>
					</label>
					{published ? (
						<label
							htmlFor={`unpublish`}
							className="btn btn-xs btn-circle btn-ghost  tooltip tooltip-left capitalize"
							data-tip="unpublish"
							onClick={onAction}
						>
							<TbNewsOff
								className="ml-1 mt-1 text-white"
								size={15}
							/>
						</label>
					) : (
						<label
							htmlFor={`publish`}
							className="btn btn-xs btn-circle btn-ghost tooltip-left tooltip capitalize"
							data-tip="publish"
							onClick={onAction}
						>
							<TbNews
								className="ml-1 mt-1 text-white"
								size={15}
							/>
						</label>
					)}
					<label
						htmlFor={`delete`}
						className="btn btn-xs btn-circle btn-ghost  tooltip tooltip-left capitalize"
						data-tip="delete"
						onClick={onAction}
					>
						<AiFillDelete
							className="ml-1 mt-1 text-white"
							size={15}
						/>
					</label>
				</div>
			)}

			<div className="flex text-xs text-white/50">
				<p
					onClick={() => router.push(`/profile/${created_by}`)}
					className="link link-hover"
				>
					{author}
				</p>
				<div className="divider divider-horizontal"></div>
				<span className="">
					{published_on
						? new Date(published_on).toDateString()
						: "Not Published"}
				</span>
				<div className="divider divider-horizontal"></div>
				<span className="flex items-center gap-1">
					{upvotes &&
						upvotes > 0 &&
						formatter.current.format(upvotes)}{" "}
					<BiUpvote />
				</span>
			</div>
			<p className="italic">{description}</p>
		</div>
	);
};

export default PostComponent;
