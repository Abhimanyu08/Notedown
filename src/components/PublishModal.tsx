import { MouseEventHandler } from "react";
import { SUPABASE_POST_TABLE } from "../../utils/constants";
import { sendRevalidationRequest } from "../../utils/sendRequest";
import { supabase } from "../../utils/supabaseClient";
import ModalProps from "../interfaces/ModalProps";

export function PublishModal({
	post: { id, created_by, title, published_on },
	modifyPosts,
}: ModalProps) {
	const onPublish: MouseEventHandler = async (e) => {
		const { data, error } = await supabase
			.from(SUPABASE_POST_TABLE)
			.update({
				published: true,
				published_on: published_on
					? published_on
					: new Date().toISOString(),
			})
			.match({ id });
		if (error || !data || data.length === 0) {
			alert("Error in publishing post");
			return;
		}

		sendRevalidationRequest(`/profile/${created_by}`);
		sendRevalidationRequest(`/posts/${id}`);
		sendRevalidationRequest("/");

		modifyPosts("unpublished", (prev) =>
			prev?.filter((post) => post.id !== id)
		);

		modifyPosts("published", (prev) => [data.at(0), ...(prev || [])]);
	};
	return (
		<>
			<input type="checkbox" id={`publish`} className="modal-toggle" />
			<label className="modal" htmlFor={`publish`}>
				<label className="modal-box bg-cyan-500 text-black relative">
					Are you ready to publish your post{" "}
					<span className="font-bold text-black">{title}</span> ?
					<div className="modal-action">
						<label
							htmlFor={`publish`}
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
