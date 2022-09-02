import { Dispatch, MouseEventHandler, SetStateAction } from "react";
import { SUPABASE_POST_TABLE } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Post from "../interfaces/Post";

export function UnPublishModal({
	id,
	modifyPosts,
}: {
	id: number;

	modifyPosts: (
		type: "published" | "unpublished",
		newPosts: SetStateAction<Partial<Post>[] | null | undefined>
	) => void;
}) {
	const onPublish: MouseEventHandler = async (e) => {
		const { data, error } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.update({
				published: false,
				published_on: null,
			})
			.match({ id });
		if (error || !data || data.length === 0) {
			alert("Error in unpublishing post");
			return;
		}
		modifyPosts("published", (prev) =>
			prev?.filter((post) => post.id !== id)
		);

		modifyPosts("unpublished", (prev) => [...(prev || []), ...data]);
	};
	return (
		<>
			<input
				type="checkbox"
				id={`unpublish-${id}`}
				className="modal-toggle"
			/>
			<label className="modal" htmlFor={`unpublish-${id}`}>
				<label className="modal-box bg-cyan-500 text-black relative">
					Are you sure you want to unpublish this post?
					<div className="modal-action">
						<label
							htmlFor={`unpublish-${id}`}
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
