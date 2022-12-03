import { Dispatch, SetStateAction } from "react";

type PostType = "latest" | "greatest" | "private" | "upvoted";

export function PostTypeSelecter({
	owner,
	postType,
	setPostType,
}: {
	owner: boolean;
	postType: PostType;
	setPostType: Dispatch<SetStateAction<PostType>>;
}) {
	return (
		<select
			className="select select-sm text-xs lg:text-sm w-fit rounded-md"
			onChange={(e) => setPostType(e.target.value as PostType)}
			value={postType}
		>
			<option value="latest">Recently Published</option>
			<option value="greatest">Most Popular</option>
			{owner && <option value="private">Private Posts</option>}
			{owner && <option value="upvoted">Upvoted by you</option>}
		</select>
	);
}
