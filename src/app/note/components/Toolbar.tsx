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
import useOwner from "@/hooks/useOwner";
import { useToast } from "@components/ui/use-toast";
import { BookOpen, User2 } from "lucide-react";

// const formatter = Intl.NumberFormat("en", { notation: "compact" });

function Toolbar() {
	const { blogState } = useContext(BlogContext);
	const owner = useOwner(blogState.blogMeta.blogger?.id);
	const { toast } = useToast();

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
					navigator.clipboard
						.writeText(window.location.toString())
						.then(() => {
							toast({
								title: "Link copied!!",
								duration: 2000,
							});
						});
				}}
			>
				<IoMdShareAlt size={30} />
			</ToolTipComponent>

			{owner && (
				<ToolTipComponent
					tip="Edit"
					className={`text-gray-400 hover:text-white active:scale-95`}
				>
					<Link
						href={
							`/write/${blogState.blogMeta.id}` +
							(blogState.blogMeta.timeStamp
								? `?draft=${blogState.blogMeta.timeStamp}`
								: "")
						}
					>
						<AiFillEdit size={28} />
					</Link>
				</ToolTipComponent>
			)}
			<ToolTipComponent
				tip={`View all notes from ${
					blogState.blogMeta.blogger?.name || " this author"
				}`}
				className={`text-gray-400 hover:text-white active:scale-95`}
			>
				<Link href={`/notebook/${blogState.blogMeta.blogger?.id}`}>
					<BookOpen />
				</Link>
			</ToolTipComponent>
		</>
	);
}

export default Toolbar;
