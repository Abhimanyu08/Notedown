import { GetStaticPaths, GetStaticProps } from "next";
import { BiCodeAlt, BiUpvote } from "react-icons/bi";
import { IoMdShareAlt } from "react-icons/io";
import Head from "next/head";
import { useRouter } from "next/router";
import { MouseEventHandler, useContext, useEffect, useState } from "react";
import {
	SUPABASE_FILES_BUCKET,
	SUPABASE_POST_TABLE,
	SUPABASE_UPVOTES_TABLE,
} from "../../../utils/constants";
import { getHtmlFromMarkdown } from "../../../utils/getResources";
import { supabase } from "../../../utils/supabaseClient";
import { Blog } from "../../components/Blog";
import BlogLayout from "../../components/BlogLayout";
import PostWithBlogger from "../../interfaces/PostWithBlogger";
import { BlogProps } from "../../interfaces/BlogProps";
import { UserContext } from "../_app";
import Layout from "../../components/Layout";
import sendRequest from "../../../utils/sendRequest";
import { BsBookmarkFill } from "react-icons/bs";
import { Toc } from "../../components/TableOfContents";
import Upvotes from "../../interfaces/Upvotes";

function checkProps(props: BlogProps | {}): props is BlogProps {
	return (props as BlogProps).title !== undefined;
}

export default function PublicBlog(props: BlogProps | {}) {
	const { user } = useContext(UserContext);
	const router = useRouter();
	const [containerId, setContainerId] = useState<string>();
	const [connecting, setConnecting] = useState(false);
	const [upvoted, setUpvoted] = useState(false);
	const { postId } = router.query;

	if (router.isFallback || !checkProps(props)) {
		console.log("rendering this");
		return (
			<Layout user={null} route={"/"} logoutCallback={() => null}>
				<div
					className={`mx-auto prose  max-w-none lg:w-5/6 xl:w-4/6 prose-headings:text-cyan-500 text-white prose-a:text-amber-400 prose-strong:text-amber-500
				prose-pre:m-0 prose-pre:p-0 animate-pulse
				`}
				>
					<h1 className="h-5 text-center bg-slate-600 rounded w-1/2 mx-auto"></h1>
					<p className="h-3 text-center italic bg-slate-600 rounded"></p>
					<div className="h-32 bg-slate-600 rounded"></div>
					<p className="h-3 text-center italic bg-slate-600 rounded"></p>
					<div className="h-32 bg-slate-600 rounded"></div>
					<p className="h-3 text-center italic bg-slate-600 rounded"></p>
					<div className="h-32 bg-slate-600 rounded"></div>
				</div>
			</Layout>
		);
	}

	useEffect(() => {
		const fetchUpvote = async () => {
			if (!user) return;
			const { data, error } = await supabase
				.from<Upvotes>(SUPABASE_UPVOTES_TABLE)
				.select()
				.match({ upvoter: user.id, post_id: postId });
			if (error || !data || data.length === 0) return;

			setUpvoted(true);
		};

		fetchUpvote();
	}, [user]);

	const prepareContainer = async () => {
		if (!user) return;
		if (containerId) return;
		setConnecting(true);
		try {
			const resp = await sendRequest("POST", {
				language: (props as BlogProps).language,
			});

			if (resp.status !== 201) {
				console.log(resp.statusText);
				alert("Couldn't set up remote code execution");
				setConnecting(false);
				return;
			}
			const body: { containerId: string } = await resp.json();
			setContainerId(body.containerId);
			setConnecting(false);
		} catch (_) {
			setConnecting(false);
			alert("Couldn't enable remote code execution");
		}
	};

	const onUpvote: MouseEventHandler = async () => {
		if (upvoted || !user || !postId) return;

		const { data, error } = await supabase
			.from<Upvotes>(SUPABASE_UPVOTES_TABLE)
			.insert({ upvoter: user.id, post_id: parseInt(postId as string) });
		if (error || !data || data.length === 0) return;
		setUpvoted(true);
	};

	return (
		<>
			<Head>
				<title>{props.title || ""}</title>
				<meta name="author" content={props.bloggers.name} />
				<meta name="description" content={props.description} />
				<meta name="keywords" content={props.language} />
			</Head>
			<Layout
				user={user || null}
				route={router.asPath}
				logoutCallback={() => null}
			>
				<BlogLayout>
					<div className="basis-1/5 flex flex-col justify-center">
						<Toc html={props?.content} />
					</div>
					<Blog {...props} containerId={containerId} />
					<div className="flex flex-col basis-1/5 w-fit mt-44 pl-5 gap-4">
						<div
							className={` btn btn-circle  btn-ghost tooltip`}
							data-tip={` ${
								user
									? "Enable remote code execution"
									: "Please login to enable remote code execution"
							} `}
							onClick={prepareContainer}
						>
							<BiCodeAlt
								size={30}
								className={` ${
									containerId ? "text-lime-400" : "text-white"
								}${connecting ? "hidden" : ""} mt-2 ml-2 `}
							/>
						</div>

						<div
							className="btn btn-circle btn-ghost tooltip"
							data-tip="share"
						>
							<IoMdShareAlt
								size={30}
								className="text-white mt-2 ml-2"
							/>
						</div>

						<div
							className="btn btn-circle  btn-ghost tooltip"
							data-tip={` ${
								user ? "Upvote" : "Please login to upvote"
							} `}
							onClick={onUpvote}
						>
							<BiUpvote
								size={30}
								className={`mt-2 ml-2 ${
									upvoted ? "text-lime-400" : "text-white"
								}`}
							/>
						</div>
					</div>
				</BlogLayout>
			</Layout>
		</>
	);
}

export const getStaticPaths: GetStaticPaths = async () => {
	return { paths: [], fallback: true };
};

export const getStaticProps: GetStaticProps<
	Partial<BlogProps>,
	{ postId: string }
> = async (context) => {
	const { data, error } = await supabase
		.from<PostWithBlogger>(SUPABASE_POST_TABLE)
		.select("*, bloggers(name)")
		.match({ id: context.params?.postId });

	if (error || !data || data.length == 0) return { props: {}, redirect: "/" };

	const post = data[0];
	const filename = post.filename;
	const { data: fileData, error: fileError } = await supabase.storage
		.from(SUPABASE_FILES_BUCKET)
		.download(filename);

	if (fileError || !fileData) return { props: {} };
	const content = await getHtmlFromMarkdown(fileData);

	return {
		props: {
			...post,
			content,
		},
	};
};
