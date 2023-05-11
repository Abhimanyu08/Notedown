"use client";
import { BlogProps } from "interfaces/BlogProps";
import React, {
	MouseEventHandler,
	useContext,
	useEffect,
	useState,
} from "react";
import { BlogContext } from "./BlogState";
import { BiCodeAlt } from "react-icons/bi";
import { usePathname } from "next/navigation";
import { UserContext } from "../appContext";
import Upvotes from "interfaces/Upvotes";
import { FaHeart } from "react-icons/fa";
import { IoMdShareAlt } from "react-icons/io";
import Post from "../../interfaces/Post";
import { SUPABASE_UPVOTES_TABLE, SUPABASE_POST_TABLE } from "@utils/constants";
import { sendRequestToRceServer } from "@utils/sendRequest";
import { supabase } from "@utils/supabaseClient";

const formatter = Intl.NumberFormat("en", { notation: "compact" });

function Toolbar(props: { id: number; language: BlogProps["language"] | "" }) {
	const pathname = usePathname();
	const { blogState, dispatch } = useContext(BlogContext);
	const { user } = useContext(UserContext);
	const [linkCopied, setLinkCopied] = useState(false);

	const [upvoted, setUpvoted] = useState<boolean | null>(null);
	const [upvotes, setUpvotes] = useState<number | null>(null);

	const fetchUpvote = async () => {
		if (!user) return;
		const { data, error } = await supabase
			.from<Upvotes>(SUPABASE_UPVOTES_TABLE)
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
			.from<Post>(SUPABASE_POST_TABLE)
			.select("upvote_count")
			.eq("id", props.id);
		if (error || !data || data.length === 0) return;
		setUpvotes(data.at(0)?.upvote_count || 0);
	};

	useEffect(() => {
		fetchUpvote();
		fetchUpvotes();
	}, []);

	const prepareContainer = async () => {
		if (blogState.containerId || !props.language) return;
		try {
			const resp = await sendRequestToRceServer("POST", {
				language: props.language,
			});

			if (resp.status !== 201) {
				console.log(resp.statusText);
				alert("Couldn't set up remote code execution");
				return;
			}
			const body: { containerId: string } = await resp.json();
			dispatch({ type: "set containerId", payload: body.containerId });
		} catch (_) {
			alert("Couldn't enable remote code execution");
		}
	};
	const onUpvote: MouseEventHandler = async () => {
		if (!user || !props.id) return;
		if (upvoted) {
			setUpvoted(false);
			setUpvotes((prev) => prev! - 1);
			await supabase
				.from<Upvotes>(SUPABASE_UPVOTES_TABLE)
				.delete()
				.match({ post_id: props.id, upvoter: user.id });
			return;
		}

		setUpvoted(true);
		setUpvotes((prev) => (prev || 0) + 1);
		await supabase
			.from<Upvotes>(SUPABASE_UPVOTES_TABLE)
			.insert({ upvoter: user.id, post_id: props.id });
	};

	return (
		<>
			{props.language && (
				<div
					className={`btn btn-circle ${
						blogState.containerId ? "" : "btn-ghost"
					} tooltip`}
					data-tip={` ${
						user
							? "Enable remote code execution"
							: "Enable remote code execution"
					} `}
					onClick={prepareContainer}
				>
					<BiCodeAlt
						size={30}
						className={` ${
							blogState.containerId
								? "text-lime-400"
								: "text-black dark:text-white"
						} mt-2 ml-2 `}
					/>
				</div>
			)}

			<div
				className="btn btn-circle btn-ghost tooltip relative"
				data-tip="share"
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
				<IoMdShareAlt
					size={30}
					className="text-black dark:text-white mt-2 ml-2"
				/>
				<span
					className={` normal-case absolute left-10 top-2 text-lime-400 ${
						linkCopied ? "" : "hidden"
					}`}
				>
					Link Copied!
				</span>
			</div>

			<div className="flex items-center">
				<div
					className="btn btn-circle  btn-ghost tooltip"
					data-tip={` ${
						user
							? `${upvoted ? "Remove Upvote" : "Upvote"}`
							: "Please login to upvote"
					} `}
					onClick={onUpvote}
				>
					<FaHeart
						size={26}
						className={`mt-3 ml-[10px] ${
							upvoted
								? "text-rose-500"
								: "dark:text-white text-black"
						}`}
					/>
				</div>
				<span>{formatter.format(upvotes || 0)}</span>
			</div>
		</>
	);
}

export default Toolbar;
