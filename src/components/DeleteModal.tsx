import { PostgrestError } from "@supabase/supabase-js";
import { Dispatch, MouseEventHandler, SetStateAction } from "react";
import {
	SUPABASE_FILES_BUCKET,
	SUPABASE_IMAGE_BUCKET,
	SUPABASE_POST_TABLE,
} from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Post from "../interfaces/Post";

export function DeleteModal({
	id,
	title,
	filename,
	created_by,
	type,
	modifyPosts,
}: {
	title: string;
	id: number;
	filename: string;

	type: "published" | "unpublished";
	modifyPosts: (
		type: "published" | "unpublished",
		newPosts: SetStateAction<Partial<Post>[] | null | undefined>
	) => void;
	created_by: string;
}) {
	const onDelete: MouseEventHandler = async (e) => {
		let postData: Post | undefined, imageData, error;
		await Promise.all([
			//delete the row corresponding to this post from the table
			supabase
				.from<Post>(SUPABASE_POST_TABLE)
				.delete()
				.match({ id })
				.then((val) => {
					postData = val.data?.at(0);
				}),

			//delete the file corresponding to this post from file storage
			supabase.storage
				.from(SUPABASE_FILES_BUCKET)
				.remove([filename])
				.then((val) => (error = val.error)),

			//delete the image corresponding to this post from image storage
			supabase.storage
				.from(SUPABASE_IMAGE_BUCKET)
				.list(`${created_by}/${title}`)
				.then((val) => {
					imageData = val.data;
					error = val.error;
				}),
		]);

		if (error) {
			alert("delete failed for some reason");
			return;
		}
		if (imageData && postData) {
			await supabase.storage
				.from(SUPABASE_IMAGE_BUCKET)
				.remove(
					(imageData as { name: string }[]).map(
						(obj) =>
							`${(postData as Post).image_folder}/${obj.name}`
					)
				);
		}

		modifyPosts(type, (prev) => prev?.filter((post) => post.id !== id));
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
