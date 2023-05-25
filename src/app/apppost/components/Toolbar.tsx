"use client";
import { useSupabase } from "@/app/appContext";
import prepareContainer from "@/app/utils/prepareContainer";
import { SUPABASE_POST_TABLE, SUPABASE_UPVOTES_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import { BlogProps } from "interfaces/BlogProps";
import { usePathname } from "next/navigation";
import { MouseEventHandler, useContext, useEffect, useState } from "react";
import { BiCodeAlt } from "react-icons/bi";
import { FaHeart } from "react-icons/fa";
import { IoMdShareAlt } from "react-icons/io";
import { BlogContext } from "./BlogState";
import ToolbarButton from "./ToolbarButton";

const formatter = Intl.NumberFormat("en", { notation: "compact" });

function Toolbar(props: { id: string; language: BlogProps["language"] | "" }) {
	const pathname = usePathname();
	const { blogState, dispatch } = useContext(BlogContext);
	const { session } = useSupabase();
	const user = session?.user;
	const [linkCopied, setLinkCopied] = useState(false);

	const [upvoted, setUpvoted] = useState<boolean | null>(null);
	const [upvotes, setUpvotes] = useState<number | null>(null);

	const fetchUpvote = async () => {
		if (!user) return;
		const { data, error } = await supabase
			.from(SUPABASE_UPVOTES_TABLE)
			.select()
			.match({ upvoter: user.id, post_id: props.id });

		if (error || !data) return;
		if (data.length === 0) {
			setUpvoted(false);
			return;
		}
		setUpvoted(true);
	};

	const fetchUpvotes = async () => {
		const { data, error } = await supabase
			.from(SUPABASE_POST_TABLE)
			.select("upvote_count")
			.eq("id", props.id);
		if (error || !data || data.length === 0) return;
		setUpvotes(data.at(0)?.upvote_count || 0);
	};

	useEffect(() => {
		fetchUpvote();
		fetchUpvotes();
	}, []);

	const onUpvote: MouseEventHandler = async () => {
		if (!user || !props.id) return;
		if (upvoted) {
			setUpvoted(false);
			setUpvotes((prev) => prev! - 1);
			await supabase
				.from(SUPABASE_UPVOTES_TABLE)
				.delete()
				.match({ post_id: props.id, upvoter: user.id });
			return;
		}

		setUpvoted(true);
		setUpvotes((prev) => (prev || 0) + 1);
		await supabase
			.from(SUPABASE_UPVOTES_TABLE)
			.insert({ upvoter: user.id, post_id: parseInt(props.id) });
	};

	return (
		<>
			{props.language && (
				<ToolbarButton
					tip={` ${
						user
							? "Enable remote code execution"
							: "Enable remote code execution"
					} `}
					onClick={() =>
						prepareContainer(
							blogState.blogMeta.language,
							blogState.containerId
						).then((containerId) => {
							if (!containerId) return;
							dispatch({
								type: "set containerId",
								payload: containerId,
							});
						})
					}
				>
					<BiCodeAlt
						size={30}
						className={` ${
							blogState.containerId
								? "text-lime-400"
								: "text-black dark:text-white"
						}`}
					/>
				</ToolbarButton>
			)}

			<ToolbarButton
				className="relative"
				tip="Share this post"
				onClick={() => {
					const link =
						window.location.hostname === "localhost"
							? `${window.location.protocol}//${window.location.hostname}:3000${pathname}`
							: `${window.location.protocol}//${window.location.hostname}${pathname}`;
					navigator.clipboard.writeText(link).then(() => {
						setLinkCopied(true);
						setTimeout(() => setLinkCopied(false), 2000);
					});
				}}
			>
				<IoMdShareAlt size={30} />
				<span
					className={` normal-case absolute left-10 top-2 text-lime-400 ${
						linkCopied ? "" : "hidden"
					}`}
				>
					Link Copied!
				</span>
			</ToolbarButton>

			<div className="flex items-center gap-2">
				<ToolbarButton
					tip={` ${
						user
							? `${upvoted ? "Remove Upvote" : "Upvote"}`
							: "Please login to upvote"
					} `}
					onClick={onUpvote}
				>
					<FaHeart
						size={26}
						className={`${
							upvoted
								? "text-rose-500"
								: "dark:text-white text-black"
						}`}
					/>
				</ToolbarButton>
				<span>{formatter.format(upvotes || 0)}</span>
			</div>
		</>
	);
}

export default Toolbar;
