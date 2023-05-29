import { MouseEventHandler } from "react";
import Post from "../../interfaces/Post";
import ModalProps from "@/interfaces/ModalProps";
import { SUPABASE_POST_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";

export function PublishModal({ post, afterActionCallback }: ModalProps) {
	const { id, title, published_on } = post;
	const onPublish: MouseEventHandler = async (e) => {
		if (!id) return;
		const { data, error } = await supabase
			.from(SUPABASE_POST_TABLE)
			.update({
				published: true,
				published_on: published_on
					? published_on
					: new Date().toISOString(),
			})
			.match({ id })
			.select("*");
		if (error || !data || data.length === 0) {
			alert("Error in publishing post");
			return;
		}

		afterActionCallback(data.at(0)!);
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
