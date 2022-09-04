import { Dispatch, MouseEventHandler, SetStateAction, useState } from "react";
import { SUPABASE_POST_TABLE } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import ModalProps from "../interfaces/ModalProps";
import Post from "../interfaces/Post";

export function EditModal({
	post: { title, description, id, published },
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
		modifyPosts(published ? "published" : "unpublished", (prev) =>
			prev?.filter((post) => post.id !== id).concat(data)
		);
	};

	return (
		<>
			<input type="checkbox" id={`edit`} className="modal-toggle" />
			<label className="modal" htmlFor={`edit`}>
				<label className="modal-box bg-cyan-500 text-black flex flex-col gap-4 relative">
					<div className="w-full font-semibold">
						<p>Title:</p>
						<input
							name=""
							id=""
							className="input w-full text-white bg-slate-900"
							value={newTitle}
							onChange={(e) => setNewTitle(e.target.value)}
						/>
					</div>
					<div className="w-full font-semibold">
						<p>Description:</p>
						<textarea
							name=""
							id=""
							className="textarea text-white w-full bg-slate-900"
							value={newDesc}
							onChange={(e) => setNewDesc(e.target.value)}
						/>
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
