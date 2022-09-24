import { MouseEventHandler, useState } from "react";
import {
	DESCRIPTION_LENGTH,
	SUPABASE_POST_TABLE,
	TITLE_LENGTH,
} from "../../utils/constants";
import { sendRevalidationRequest } from "../../utils/sendRequest";
import { supabase } from "../../utils/supabaseClient";
import ModalProps from "../interfaces/ModalProps";
import Post from "../interfaces/Post";

export function EditModal({
	post: { title, description, id, published, created_by },
	modifyPosts,
}: ModalProps) {
	const [newTitle, setNewTitle] = useState(title);
	const [newDesc, setNewDesc] = useState(description);

	const onSave: MouseEventHandler = async (e) => {
		if (newTitle === title && description === newDesc) return;

		const { data, error } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.update({ title: newTitle, description: newDesc })
			.match({ id });
		if (error || !data || data.length === 0) {
			console.log(error);
			return;
		}
		if (published) {
			sendRevalidationRequest(`/posts/${id}`);
			sendRevalidationRequest(`/profile/${created_by}`);
			sendRevalidationRequest(`/`);
		}

		modifyPosts(published ? "published" : "unpublished", (prev) =>
			prev?.map((post) => {
				if (post.id !== id) return post;
				return data.at(0)!;
			})
		);
	};

	return (
		<>
			<input type="checkbox" id={`edit`} className="modal-toggle" />
			<label className="modal" htmlFor={`edit`}>
				<label className="modal-box bg-cyan-500 text-black flex flex-col gap-4 relative">
					<div className="w-full font-semibold relative">
						<p>Title:</p>
						<input
							name=""
							id=""
							className="input w-full text-white bg-slate-900"
							value={newTitle}
							onChange={(e) => {
								if (e.target.value.length <= TITLE_LENGTH)
									setNewTitle(e.target.value);
							}}
						/>

						<span className="absolute right-2 top-8 text-cyan-500">
							{TITLE_LENGTH - (newTitle?.length || 0)}
						</span>
					</div>
					<div className="w-full font-semibold relative">
						<p>Description:</p>
						<textarea
							name=""
							id=""
							className="textarea text-white w-full bg-slate-900"
							value={newDesc}
							onChange={(e) => {
								if (e.target.value.length < DESCRIPTION_LENGTH)
									setNewDesc(e.target.value);
							}}
						/>
						<span className="absolute right-2 top-8 text-cyan-500">
							{DESCRIPTION_LENGTH - (newDesc?.length || 0)}
						</span>
					</div>
					<div className="modal-action">
						<label
							htmlFor={`edit`}
							className={`btn capitalize btn-sm text-white ${
								title !== newTitle || description !== newDesc
									? ""
									: "btn-disabled"
							}`}
							onClick={onSave}
						>
							Save
						</label>
					</div>
				</label>
			</label>
		</>
	);
}
