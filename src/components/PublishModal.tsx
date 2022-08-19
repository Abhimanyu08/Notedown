import { Dispatch, MouseEventHandler, SetStateAction } from "react";
import { SUPABASE_POST_TABLE } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Post from "../interfaces/Post";

export function PublishModal({
	id,
	setClientPosts,
}: {
	id: number;

	setClientPosts?: Dispatch<SetStateAction<Post[] | null | undefined>>;
}) {
	const onPublish: MouseEventHandler = async (e) => {
		const { data, error } = await supabase
			.from(SUPABASE_POST_TABLE)
			.update({
				published: true,
				published_on: new Date().toDateString(),
			})
			.match({ id });
		if (error || !data || data.length === 0) {
			alert("Error in publishing post");
			return;
		}
		setClientPosts!((prev) =>
			prev?.map((post) => {
				if (post.id !== id) return post;
				return data.at(0);
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
