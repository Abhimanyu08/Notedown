import { MouseEventHandler } from "react";
import {
	SUPABASE_FILES_BUCKET,
	SUPABASE_IMAGE_BUCKET,
	SUPABASE_POST_TABLE,
} from "../../utils/constants";
import { sendRevalidationRequest } from "../../utils/sendRequest";
import { supabase } from "../../utils/supabaseClient";
import ModalProps from "../interfaces/ModalProps";
import Post from "../interfaces/Post";

export function DeleteModal({ post, modifyPosts }: ModalProps) {
	const onDelete: MouseEventHandler = async (e) => {
		let { id, filename, published, image_folder, created_by } = post;

		let postData: Post | undefined, imageData, error;
		if (!filename || !image_folder || !created_by) {
			const { data, error } = await supabase
				.from<Post>(SUPABASE_POST_TABLE)
				.select("filename, image_folder, created_by")
				.match({ id });

			if (error || !data) return;

			filename = data.at(0)?.filename!;
			image_folder = data?.at(0)?.image_folder!;
			created_by = data?.at(0)?.created_by!;
		}
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
				.list(image_folder!)
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

		if (published) {
			sendRevalidationRequest(`/posts/${id}`);
			sendRevalidationRequest(`/profile/${created_by}`);
			sendRevalidationRequest(`/`);
		}

		modifyPosts(published ? "published" : "unpublished", (prev) =>
			prev?.filter((post) => post.id !== id)
		);
	};
	return (
		<>
			<input type="checkbox" id={`delete`} className="modal-toggle" />
			<label htmlFor={`delete`} className="modal  text-black">
				<label className="modal-box bg-cyan-500 relative">
					<p>
						Are you sure you want to delete your post{" "}
						<span className="font-semibold">{post.title}</span>?
					</p>
					<div className="modal-action">
						<label
							htmlFor={`delete`}
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
