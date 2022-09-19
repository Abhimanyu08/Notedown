import {
	ChangeEventHandler,
	Dispatch,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import { MdCancel } from "react-icons/md";
import { LIMIT, SUPABASE_POST_TABLE } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Post from "../interfaces/Post";
import PostWithBlogger from "../interfaces/PostWithBlogger";

interface SearchComponentProps {
	setPosts: (newPosts: PostWithBlogger[] | Post[]) => void;
	profileId?: string;
	setSearchQuery: Dispatch<SetStateAction<string>>;
}

function SearchComponent({
	setPosts,
	profileId,
	setSearchQuery,
}: SearchComponentProps) {
	const [searchTerm, setSearchTerm] = useState<string>();
	const [_, setTimer] = useState<NodeJS.Timeout>();

	const onSearchTermInput: ChangeEventHandler<HTMLInputElement> = (e) => {
		setSearchTerm(e.target.value.split(" ").join(" | "));
	};

	useEffect(() => {
		setTimer((prev) => {
			clearTimeout(prev);
			return setTimeout(() => {
				setSearchQuery(searchTerm || "");
				search(searchTerm);
			}, 500);
		});
	}, [searchTerm]);

	const search = async (term?: string) => {
		if (term === undefined) return;
		if (term === "") {
			setPosts([]);
			return;
		}
		if (!profileId) {
			const { data, error } = await supabase
				.from<PostWithBlogger>(SUPABASE_POST_TABLE)
				.select("*, bloggers(name)")
				.textSearch("search_index_col", term)
				.order("upvote_count", { ascending: false })
				.limit(LIMIT);
			console.log(data);
			if (error || !data) return;

			setPosts(data);
			return;
		}
		const { data, error } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.select()
			.match({ created_by: profileId })
			.textSearch("search_index_col", term)
			.limit(10);

		console.log(data);
		if (error || !data) return;

		setPosts(data);
		return;
	};
	return (
		<div className="relative">
			<input
				type="text"
				name=""
				id=""
				placeholder="Search"
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
