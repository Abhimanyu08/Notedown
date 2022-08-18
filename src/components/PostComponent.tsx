import Link from "next/link";
import {
	Dispatch,
	MouseEventHandler,
	SetStateAction,
	useDebugValue,
} from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { MdPublish } from "react-icons/md";
import {
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_POST_TABLE,
} from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Post from "../interfaces/Post";
import { DeleteModal } from "./DeleteModal";
import { EditModal } from "./EditModal";

const PostComponent: React.FC<{
	postId: number;
	name: string;
	description: string;
	author: string;
	authorId: string;
	postedOn: string;
	owner: boolean;
	published?: boolean;
	filename?: string;
	setClientPosts?: Dispatch<SetStateAction<Post[] | null | undefined>>;
}> = ({
	postId,
	name,
	description,
	author,
	authorId,
	postedOn,
	owner = false,
	published,
	filename,
	setClientPosts,
}) => {
	return (
		<div className="text-white relative">
			<DeleteModal
				id={postId}
				filename={filename!}
				title={name}
				setClientPosts={setClientPosts}
			/>
			<EditModal
				id={postId}
				published={false}
				title={name}
				description={description}
				setClientPosts={setClientPosts}
			/>
			<PublishModal id={postId} setClientPosts={setClientPosts} />
			<Link href={`/posts/${postId}`}>
				<span className="text-xl font-medium">{name} </span>
			</Link>
			{owner && (
				<div className="flex absolute top-0 right-0 gap-2">
					<label
						htmlFor={`edit-${postId}`}
						className="btn btn-xs btn-circle bg-cyan-500 text-black hover:bg-cyan-800 tooltip capitalize"
						data-tip="edit"
					>
						<AiFillEdit className="ml-1 mt-1" size={15} />
					</label>
					{!published && (
						<label
							htmlFor={`publish-${postId}`}
							className="btn btn-xs btn-circle bg-cyan-500 text-black hover:bg-cyan-800 tooltip capitalize"
							data-tip="publish"
						>
							<MdPublish className="ml-1 mt-1" size={15} />
						</label>
					)}
					<label
						htmlFor={`delete-${postId}`}
						className="btn btn-xs btn-circle bg-cyan-500 text-black hover:bg-cyan-800 tooltip capitalize"
						data-tip="delete"
					>
						<AiFillDelete className="mt-1 ml-1" size={13} />
					</label>
				</div>
			)}

			<div className="flex gap-2 text-xs text-white/50">
				<Link href={`/profile/${authorId}`} className="link">
					{author}
				</Link>
				<span className="">{new Date(postedOn).toDateString()}</span>
			</div>
			<p className="italic">{description}</p>
		</div>
	);
};

function PublishModal({
	id,
	setClientPosts,
}: {
	id: number;

	setClientPosts?: Dispatch<SetStateAction<Post[] | null | undefined>>;
}) {
	const onPublish: MouseEventHandler = async () => {
		const { data, error } = await supabase
			.from(SUPABASE_POST_TABLE)
			.update({ published: true })
			.match({ id });
		if (error || !data || data.length === 0) {
			alert("Error in publishing post");
			return;
		}
		setClientPosts!((prev) =>
			prev?.map((post) => {
				if (post.id !== id) return post;
				post.published = true;
				return post;
			})
		);
	};
	return (
		<>
			<input
				type="checkbox"
				id={`publish-${id}`}
				className="modal-toggle"
			/>
			<label className="modal" htmlFor={`publish-${id}`}>
				<label className="modal-box bg-cyan-500 text-black relative">
					Are you ready to make your post public?
					<div className="modal-action">
						<label
							htmlFor={`publish-${id}`}
							className="btn btn-sm capitalize text-white"
							onClick={onPublish}
						>
							Yes
						</label>
					</div>
				</label>
			</label>
		</>
	);
}

export default PostComponent;
