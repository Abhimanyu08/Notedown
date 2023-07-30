"use client";
import useSetContainer from "@/hooks/useSetContainer";
import EnableRceButton from "@components/BlogPostComponents/EnableRceButton";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { usePathname } from "next/navigation";
import { useContext, useState } from "react";
import { IoMdShareAlt } from "react-icons/io";
import { BlogContext } from "../../../components/BlogPostComponents/BlogState";
import { AiFillEdit } from "react-icons/ai";
import Link from "next/link";

// const formatter = Intl.NumberFormat("en", { notation: "compact" });

function Toolbar() {
	const pathname = usePathname();
	const { blogState } = useContext(BlogContext);
	const [linkCopied, setLinkCopied] = useState(false);

	// const [upvoted, setUpvoted] = useState<boolean | null>(null);
	// const [upvotes, setUpvotes] = useState<number | null>(null);

	// const fetchUpvote = async () => {
	// 	if (!user) return;
	// 	const { data, error } = await supabase
	// 		.from(SUPABASE_UPVOTES_TABLE)
	// 		.select()
	// 		.match({ upvoter: user.id, post_id: props.id });

	// 	if (error || !data) return;
	// 	if (data.length === 0) {
	// 		setUpvoted(false);
	// 		return;
	// 	}
	// 	setUpvoted(true);
	// };

	// const fetchUpvotes = async () => {
	// 	const { data, error } = await supabase
	// 		.from(SUPABASE_POST_TABLE)
	// 		.select("upvote_count")
	// 		.eq("id", props.id);
	// 	if (error || !data || data.length === 0) return;
	// 	setUpvotes(data.at(0)?.upvote_count || 0);
	// };

	// useEffect(() => {
	// 	fetchUpvote();
	// 	fetchUpvotes();
	// }, []);

	// const onUpvote: MouseEventHandler = async () => {
	// 	if (!user || !props.id) return;
	// 	if (upvoted) {
	// 		setUpvoted(false);
	// 		setUpvotes((prev) => prev! - 1);
	// 		await supabase
	// 			.from(SUPABASE_UPVOTES_TABLE)
	// 			.delete()
	// 			.match({ post_id: props.id, upvoter: user.id });
	// 		return;
	// 	}

	// 	setUpvoted(true);
	// 	setUpvotes((prev) => (prev || 0) + 1);
	// 	await supabase
	// 		.from(SUPABASE_UPVOTES_TABLE)
	// 		.insert({ upvoter: user.id, post_id: props.id });
	// };

	return (
		<>
			{blogState.blogMeta.language && <EnableRceButton />}

			<ToolTipComponent
				className="relative text-gray-400 hover:text-white active:scale-95"
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
			</ToolTipComponent>
			<ToolTipComponent
				tip="Edit markdown"
				className={`text-gray-400 hover:text-white active:scale-95`}
			>
				<Link href={`/write/${blogState.blogMeta.id}`}>
					<AiFillEdit size={28} />
				</Link>
			</ToolTipComponent>
		</>
	);
}

export default Toolbar;
