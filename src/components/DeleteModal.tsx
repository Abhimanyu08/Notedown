import { Dispatch, MouseEventHandler, SetStateAction } from "react";
import {
	SUPABASE_BUCKET_NAME,
	SUPABASE_POST_TABLE,
} from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Post from "../interfaces/Post";

export function DeleteModal({
	id,
	title,
	filename,
	setClientPosts,
}: {
	title: string;
	id: number;
	filename: string;
	setClientPosts?: Dispatch<
		SetStateAction<Partial<Post>[] | null | undefined>
	>;
}) {
	const onDelete: MouseEventHandler = async (e) => {
		const { error: tableError } = await supabase
			.from(SUPABASE_POST_TABLE)
			.delete()
			.match({ id });
		const { error: storageError } = await supabase.storage
			.from(SUPABASE_BUCKET_NAME)
			.remove([filename]);

		if (tableError || storageError) {
			console.log("Table Error -> ", tableError);
			console.log("Storage Error -> ", storageError);
			alert("delete failed for some reason");
			return;
		}
		setClientPosts!((prev) => prev?.filter((post) => post.id !== id));
	};
	return (
		<>
			<input
				type="checkbox"
				id={`delete-${id}`}
				className="modal-toggle"
			/>
			<label htmlFor={`delete-${id}`} className="modal  text-black">
				<label className="modal-box bg-cyan-500 relative">
					<p>
						Are you sure you want to delete your post{" "}
						<span className="font-semibold">{title}</span>?
					</p>
					<div className="modal-action">
						<label
							htmlFor={`delete-${id}`}
							className="btn-sm btn capitalize bg-red-600 text-black border-2"
							onClick={onDelete}
						>
							Yes
						</label>
					</div>
				</label>
			</label>
		</>
	);
}
