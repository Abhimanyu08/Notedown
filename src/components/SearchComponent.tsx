import {
	ChangeEventHandler,
	Dispatch,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import { MdCancel } from "react-icons/md";
import Post from "../interfaces/Post";
import PostWithBlogger from "../interfaces/PostWithBlogger";

interface SearchComponentProps {
	placeholder?: string;
	setPosts: (newPosts: PostWithBlogger[] | Post[]) => void;
	setSearchQuery: Dispatch<SetStateAction<string>>;
	fetchPosts: ({ searchTerm }: { searchTerm?: string }) => void;
}

function SearchComponent({
	placeholder = "Search",
	setPosts,
	fetchPosts,
	setSearchQuery,
}: SearchComponentProps) {
	const [searchTerm, setSearchTerm] = useState<string>();
	const [timer, setTimer] = useState<NodeJS.Timeout>();

	const onSearchTermInput: ChangeEventHandler<HTMLInputElement> = (e) => {
		setSearchTerm(e.target.value.split(" ").join(" | "));
	};

	useEffect(() => {
		clearTimeout(timer);
		setTimer(
			setTimeout(() => {
				setSearchQuery(searchTerm || "");
				search(searchTerm);
			}, 1000)
		);
	}, [searchTerm]);

	const search = async (term?: string) => {
		if (term === undefined) return;
		if (term === "") {
			setPosts([]);
			return;
		}

		fetchPosts({ searchTerm: term });
		// if (!profileId) {
		// 	const { data, error } = await supabase
		// 		.from<PostWithBlogger>(SUPABASE_POST_TABLE)
		// 		.select("*, bloggers(name)")
		// 		.textSearch("search_index_col", term)
		// 		.order("upvote_count", { ascending: false })
		// 		.limit(LIMIT);
		// 	console.log(data);
		// 	if (error || !data) return;

		// 	setPosts(data);
		// 	return;
		// }
		// const { data, error } = await supabase
		// 	.from<Post>(SUPABASE_POST_TABLE)
		// 	.select()
		// 	.match({ created_by: profileId })
		// 	.textSearch("search_index_col", term)
		// 	.limit(10);

		// console.log(data);
		// if (error || !data) return;

		// setPosts(data);
		return;
	};
	return (
		<div className="relative">
			<input
				type="text"
				name=""
				id=""
				placeholder={placeholder}
				className="w-full input input-sm md:input-sm bg-white text-black text-base"
				value={searchTerm}
				onChange={onSearchTermInput}
			/>

			{searchTerm && (
				<MdCancel
					className="absolute right-1 top-1 text-black"
					size={20}
					onClick={() => {
						setSearchTerm("");
						setPosts([]);
					}}
				/>
			)}
		</div>
	);
}

export default SearchComponent;
