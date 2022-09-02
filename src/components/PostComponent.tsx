import Link from "next/link";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useDebugValue } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { TbNews, TbNewsOff } from "react-icons/tb";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { MdOutlineCancelPresentation, MdPublish } from "react-icons/md";
import { SUPABASE_BLOGGER_TABLE } from "../../utils/constants";
import Post from "../interfaces/Post";
import { DeleteModal } from "./DeleteModal";
import { EditModal } from "./EditModal";
import { PublishModal } from "./PublishModal";
import { UnPublishModal } from "./UnPublishModal";

const PostComponent: React.FC<{
	postId: number;
	title: string;
	description: string;
	author: string;
	authorId: string;
	publishedOn?: string;
	owner: boolean;
	published?: boolean;
	filename?: string;
	modifyPosts: (
		type: "published" | "unpublished",
		newPosts: SetStateAction<Partial<Post>[] | null | undefined>
	) => void;
}> = ({
	postId,
	title,
	description,
	author,
	authorId,
	publishedOn,
	owner = false,
	published,
	filename,
	modifyPosts,
}) => {
	const router = useRouter();
	return (
		<div className="text-white relative">
			<DeleteModal
				id={postId}
				filename={filename!}
				type={published ? "published" : "unpublished"}
				{...{
					title,
					modifyPosts,
					created_by: authorId,
				}}
			/>
			<EditModal
				id={postId}
				published={published || false}
				{...{ title, description, modifyPosts }}
			/>
			<PublishModal id={postId} {...{ modifyPosts }} />
			<UnPublishModal id={postId} modifyPosts={modifyPosts} />
			<Link
				href={
					published ? `/posts/${postId}` : `/posts/preview/${postId}`
				}
			>
				<span className="text-xl font-normal link link-hover">
					{title}{" "}
				</span>
			</Link>
			{owner && (
				<div className="flex absolute top-0 right-0 gap-2">
					<label
						htmlFor={`edit-${postId}`}
						className="btn btn-xs btn-circle btn-ghost  tooltip capitalize"
						data-tip="edit"
					>
						<AiFillEdit
							className="ml-1 mt-1 text-white"
							size={15}
						/>
					</label>
					{published ? (
						<label
							htmlFor={`unpublish-${postId}`}
							className="btn btn-xs btn-circle btn-ghost  tooltip capitalize"
							data-tip="unpublish"
						>
							<TbNewsOff
								className="ml-1 mt-1 text-white"
								size={15}
							/>
						</label>
					) : (
						<label
							htmlFor={`publish-${postId}`}
							className="btn btn-xs btn-circle btn-ghost  tooltip capitalize"
							data-tip="publish"
						>
							<TbNews
								className="ml-1 mt-1 text-white"
								size={15}
							/>
						</label>
					)}
					<label
						htmlFor={`delete-${postId}`}
						className="btn btn-xs btn-circle btn-ghost  tooltip capitalize"
						data-tip="delete"
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
					onClick={() => router.push(`/profile/${authorId}`)}
					className="link link-hover"
				>
					{author}
				</p>
				<div className="divider divider-horizontal"></div>
				<span className="">{publishedOn}</span>
			</div>
			<p className="italic">{description}</p>
		</div>
	);
};

export default PostComponent;
