import Link from "next/link";
import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

const PostComponent: React.FC<{
	postId: number;
	name: string;
	description: string;
	author: string;
	authorId: string;
	postedOn: string;
	owner: boolean;
	published?: boolean;
}> = ({
	postId,
	name,
	description,
	author,
	authorId,
	postedOn,
	owner = false,
	published,
}) => {
	const [visible, setVisible] = useState(published);
	return (
		<div className="text-white relative">
			<Link href={`/posts/${postId}`}>
				<span className="text-xl font-medium">{name} </span>
			</Link>
			{owner && (
				<div className="dropdown dropdown-hover absolute right-0">
					<label tabIndex={0} className="btn btn-xs m-1">
						<BsThreeDotsVertical />
					</label>
					<ul
						tabIndex={0}
						className="dropdown-content menu rounded-lg bg-cyan-500  text-black w-max"
					>
						<li className="">
							<div className="flex">
								<label htmlFor="publish">Publish</label>
								<input
									type="checkbox"
									name=""
									id="publish"
									className=""
									checked={visible}
									onChange={() => setVisible((prev) => !prev)}
								/>
							</div>
						</li>
						<li>
							<a>Delete</a>
						</li>
					</ul>
				</div>
			)}
			<div className="flex gap-2 text-xs text-white/50">
				<Link href={`/profile/${authorId}`} className="link">
					{author}
				</Link>
				<span className="">{new Date(postedOn).toDateString()}</span>
			</div>
			<p className="italic">{description}</p>
		</div>
	);
};

export default PostComponent;
