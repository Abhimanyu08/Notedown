import { MouseEventHandler } from "react";
import { SUPABASE_POST_TABLE } from "../../../utils/constants";
import { sendRevalidationRequest } from "../../../utils/sendRequest";
import { supabase } from "../../../utils/supabaseClient";
import ModalProps from "../../interfaces/ModalProps";
import Post from "../../interfaces/Post";

export function UnPublishModal({ post, afterActionCallback }: ModalProps) {
	const { id, title } = post;
	const onPublish: MouseEventHandler = async (e) => {
		if (!id) return;
		const { data, error } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.update({
				published: false,
			})
			.match({ id });
		if (error || !data || data.length === 0) {
			alert("Error in unpublishing post");
			return;
		}

		afterActionCallback(data.at(0)!);
	};
	return (
		<>
			<input type="checkbox" id={`unpublish`} className="modal-toggle" />
			<label className="modal" htmlFor={`unpublish`}>
				<label className="modal-box bg-cyan-500 text-black relative">
					Are you sure you want to unpublish the post{" "}
					<span className="text-black font-bold">{title}</span> ?
					<div className="modal-action">
						<label
							htmlFor={`unpublish`}
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
