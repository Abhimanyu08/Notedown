import { useState } from "react";
import { ALLOWED_LANGUAGES } from "../../utils/constants";
import PostWithBlogger from "../interfaces/PostWithBlogger";

const langToBadgeColor: Record<typeof ALLOWED_LANGUAGES[number], string> = {
	javascript: "text-yellow-500",
	python: "text-green-500",
	rust: "text-red-500",
};

function Trial() {
	const [post, setPost] = useState<Partial<PostWithBlogger>>({
		title: "About RCE-Blog",
		description: "A little explainer about RCE-Blog",
		bloggers: { name: "Abhimanyu" },
		published_on: "08/11/1998",
		upvote_count: 120,
		language: "python",
	});
	return (
		<div className="w-screen h-screen">
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "rgb(15 23 42)",
				}}
			>
				<div className="flex gap-10 items-center">
					<div className="rounded-full overflow-hidden w-36">
						<img
							className="object-contain"
							src="https://newnblwzrgvnhplztbua.supabase.co/storage/v1/object/public/blogger-images/f2c61fc8-bcdb-46e9-aad2-99c0608cf485/AVATAR/KfP7KAxP_400x400.jpg"
						/>
					</div>
					<div className="flex gap-2 flex-col   tracking-wide  text-left">
						<span className="font-bold text-amber-400 text-5xl">
							{post.title}
						</span>
						<span className="text-2xl text-white italic">
							{post.description}
						</span>
						<div className="text-gray-300 divide-x-2 divide-white/25 text-sm w-full flex justify-start ">
							<span className="w-1/3 truncate">
								{post.bloggers?.name}
							</span>
							<div className="px-4">
								{new Date(post.published_on!)
									.toDateString()
									.slice(4)}
							</div>
							<div
								className={`${
									langToBadgeColor[post.language!]
								} px-4`}
							>
								{post.language}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Trial;
