import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import {
	ALLOWED_LANGUAGES,
	SUPABASE_POST_TABLE,
} from "../../../utils/constants";
import { supabase } from "../../../utils/supabaseClient";
import PostWithBlogger from "../../interfaces/PostWithBlogger";

export const config = {
	runtime: "edge",
};

const langToBadgeColor: Record<typeof ALLOWED_LANGUAGES[number], string> = {
	javascript: "text-yellow-500",
	python: "text-green-500",
	rust: "text-red-500",
};

export default async function (req: NextRequest) {
	const { searchParams } = req.nextUrl;
	const postId = searchParams.get("postId");

	if (postId) {
		const { data } = await supabase
			.from<PostWithBlogger>(SUPABASE_POST_TABLE)
			.select(
				"title, description,language, upvote_count, published_on, bloggers(name,avatar_url)"
			)
			.eq("id", parseInt(postId));
		if (!data) return <></>;
		const post = data.at(0) as PostWithBlogger;

		return new ImageResponse(
			(
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
					<div tw="flex items-center">
						<div
							tw="flex rounded-full overflow-hidden w-40 h-40"
							style={{ marginRight: "50px" }}
						>
							<img
								style={{
									objectFit: "contain",
									width: "160px",
									height: "160px",
								}}
								src={post.bloggers.avatar_url}
							/>
						</div>
						<div
							tw="flex  flex-col w-1/2    text-left"
							style={{ gap: "8px" }}
						>
							<span tw="font-bold text-amber-400 tracking-wide text-5xl">
								{post.title}
							</span>
							<span tw="text-2xl text-white italic tracking-wide">
								{post.description.slice(0, 50)}{" "}
							</span>
							<div tw="text-gray-300 text-base w-full flex justify-start ">
								<span
									tw="w-44"
									style={{
										borderRightWidth: "2px",
										borderColor: "rgb(203 213 225 0.6)",
										paddingRight: "16px",
										textOverflow: "ellipsis",
										overflow: "hidden",
										whiteSpace: "nowrap",
									}}
								>
									{post.bloggers.name}
								</span>
								<div tw="px-4">
									{new Date(post.published_on!)
										.toDateString()
										.slice(4)}
								</div>
								<div
									tw={`${
										langToBadgeColor[post.language!]
									} px-4`}
									style={{
										borderLeftWidth: "2px",
										borderColor: "rgb(203 213 225 0.6)",
									}}
								>
									{post.language}
								</div>
							</div>
						</div>
					</div>
				</div>
			),
			{
				width: 1200,
				height: 630,
			}
		);
	}

	return new ImageResponse(
		(
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
				<div tw="flex items-center">
					<div tw="flex  flex-col w-1/2  justify-center   text-left">
						<span
							tw="font-bold text-amber-400 tracking-wide text-5xl"
							style={{ fontWeight: "800" }}
						>
							RCE-Blog
						</span>
						<span
							tw="text-2xl text-white tracking-wide"
							style={{
								fontWeight: 500,
								fontStyle: "italic",
							}}
						>
							Write posts containing text, executable code and
							free hand diagrams
						</span>
					</div>
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
		}
	);
}
