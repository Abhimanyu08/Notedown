import { GetStaticPaths, GetStaticProps } from "next";
import { GiHamburgerMenu } from "react-icons/gi";
import Head from "next/head";
import { useRouter } from "next/router";
import {
	MouseEventHandler,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { BiCodeAlt, BiUpvote } from "react-icons/bi";
import { IoMdShareAlt } from "react-icons/io";
import {
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_FILES_BUCKET,
	SUPABASE_POST_TABLE,
	SUPABASE_UPVOTES_TABLE,
} from "../../../utils/constants";
import { getHtmlFromMarkdown } from "../../../utils/getResources";
import { sendRequestToRceServer } from "../../../utils/sendRequest";
import { supabase } from "../../../utils/supabaseClient";
import { Blog } from "../../components/Blog";
import BlogLayout from "../../components/BlogLayout";
import Layout from "../../components/Layout";
import { Toc } from "../../components/TableOfContents";
import Blogger from "../../interfaces/Blogger";
import { BlogProps } from "../../interfaces/BlogProps";
import Post from "../../interfaces/Post";
import PostWithBlogger from "../../interfaces/PostWithBlogger";
import Upvotes from "../../interfaces/Upvotes";
import { UserContext } from "../_app";

function checkProps(props: BlogProps | {}): props is BlogProps {
	return (props as BlogProps).title !== undefined;
}

interface PublicBlogProps extends BlogProps {
	postId: string;
}

export default function PublicBlog(props: Partial<PublicBlogProps>) {
	const { user } = useContext(UserContext);
	const router = useRouter();
	const [containerId, setContainerId] = useState<string>();
	const [connecting, setConnecting] = useState(false);
	const [upvoted, setUpvoted] = useState<boolean | null>(null);
	const [upvotes, setUpvotes] = useState<number | null>(null);
	const [author, setAuthor] = useState<string>();
	const formatter = useRef(Intl.NumberFormat("en", { notation: "compact" }));
	const { postId } = props;
	const [showContent, setShowContents] = useState(false);
	const [linkCopied, setLinkCopied] = useState(false);

	const fetchUpvote = async () => {
		if (!user) return;
		const { data, error } = await supabase
			.from<Upvotes>(SUPABASE_UPVOTES_TABLE)
			.select()
			.match({ upvoter: user.id, post_id: postId });
		if (error || !data) return;
		if (data.length === 0) {
			setUpvoted(false);
			return;
		}
		setUpvoted(true);
	};

	const fetchUpvotes = async () => {
		const { data, error } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.select("upvote_count")
			.eq("id", parseInt(postId as string));
		if (error || !data || data.length === 0) return;
		setUpvotes(data.at(0)?.upvote_count || 0);
	};

	const fetchAuthor = async () => {
		//fetching author here because author may have changed his displayname
		// and I will blow my head off before attempting to revalidate each one of his single posts
		//just because that maniac changed his username from josh to joshua

		const { data } = await supabase
			.from<Blogger>(SUPABASE_BLOGGER_TABLE)
			.select("name")
			.eq("id", props.created_by || null);
		if (data) setAuthor(data.at(0)?.name || undefined);
	};

	useEffect(() => {
		if (typeof upvotes !== "number") fetchUpvotes();
		if (!author) fetchAuthor();
		if (user && typeof upvoted !== "boolean") fetchUpvote();
	}, [user]);

	useEffect(() => {
		if (containerId) {
			window.onbeforeunload = async () =>
				await sendRequestToRceServer("DELETE", { containerId });
		}

		return () => {
			if (containerId) sendRequestToRceServer("DELETE", { containerId });
		};
	}, [containerId]);

	if (router.isFallback || !checkProps(props)) {
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

	const prepareContainer = async () => {
		if (containerId) return;
		setConnecting(true);
		try {
			const resp = await sendRequestToRceServer("POST", {
				language: props.language,
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
		if (!user || !postId) return;
		if (upvoted) {
			setUpvoted(false);
			setUpvotes((prev) => prev! - 1);
			await supabase
				.from<Upvotes>(SUPABASE_UPVOTES_TABLE)
				.delete()
				.match({ post_id: postId, upvoter: user.id });
			return;
		}

		setUpvoted(true);
		setUpvotes((prev) => (prev || 0) + 1);
		await supabase
			.from<Upvotes>(SUPABASE_UPVOTES_TABLE)
			.insert({ upvoter: user.id, post_id: parseInt(postId as string) });
	};

	return (
		<>
			<Head>
				<title>{props.title || ""}</title>
				<meta name="author" content={props.bloggers.name} />
				<meta name="description" content={props.description} />
				<meta
					name="keywords"
					content={`tech blog,Rce Blog,remote code execution,${props.language}, ${props.title}, ${props.description}`}
				/>
				<meta property="og:title" content={props.title} />
				<meta property="og:description" content={props.description} />
				<meta
					property="og:url"
					content={`https://rce-blog.xyz/posts/${props.id}`}
				/>
				<meta property="og:site_name" content="Rce Blog" />
				<meta property="og:type" content="article" />
			</Head>
			<Layout
				user={user || null}
				route={router.asPath}
				logoutCallback={() => null}
			>
				<BlogLayout>
					<div
						className={`md:basis-1/5  md:flex-col justify-center md:flex ${
							showContent
								? "absolute z-50 top-0 left-0 opacity-100 w-screen"
								: "hidden"
						}`}
					>
						<Toc
							html={props?.content}
							setShowContents={setShowContents}
						/>
					</div>

					<div
						className={`md:basis-3/5 ${
							showContent ? "opacity-0 w-screen" : "w-screen"
						}`}
					>
						<Blog
							{...props}
							containerId={containerId}
							author={author}
						/>
					</div>
					<div className="hidden md:flex md:flex-col basis-1/5 w-fit mt-44 pl-5 gap-6">
						<div
							className={` btn btn-circle  btn-ghost tooltip`}
							data-tip={` ${
								user
									? "Enable remote code execution"
									: "Enable remote code execution"
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
							className="btn btn-circle btn-ghost tooltip relative"
							data-tip="share"
							onClick={() => {
								const link =
									window.location.hostname === "localhost"
										? `${window.location.protocol}//${window.location.hostname}:3000${router.asPath}`
										: `${window.location.protocol}//${window.location.hostname}${router.asPath}`;
								navigator.clipboard.writeText(link).then(() => {
									setLinkCopied(true);
									setTimeout(
										() => setLinkCopied(false),
										2000
									);
								});
							}}
						>
							<IoMdShareAlt
								size={30}
								className="text-white mt-2 ml-2"
							/>
							<span
								className={` normal-case absolute left-10 top-2 text-lime-400 ${
									linkCopied ? "" : "hidden"
								}`}
							>
								Link Copied!
							</span>
						</div>

						<div className="flex items-center">
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
							<span>
								{formatter.current.format(upvotes || 0)}
							</span>
						</div>
					</div>
				</BlogLayout>
				<footer className="w-full flex items-center md:hidden justify-between p-3  sticky bottom-0 left-0 bg-slate-800 border-t-2 border-white/25">
					<div
						className="flex flex-col items-center"
						onClick={prepareContainer}
					>
						<BiCodeAlt
							size={20}
							className={` ${
								containerId ? "text-lime-400" : "text-white"
							}`}
						/>
						<span
							className={`text-xs ${
								containerId ? "text-lime-400" : "text-white"
							} `}
						>
							Activate RCE
						</span>
					</div>
					<div
						className="flex flex-col items-center"
						onClick={() => {
							const link =
								window.location.hostname === "localhost"
									? `${window.location.protocol}//${window.location.hostname}:3000${router.asPath}`
									: `${window.location.protocol}//${window.location.hostname}${router.asPath}`;
							navigator.clipboard.writeText(link).then(() => {
								setLinkCopied(true);
								setTimeout(() => setLinkCopied(false), 2000);
							});
						}}
					>
						<IoMdShareAlt size={20} className="text-white" />
						{linkCopied ? (
							<span
								className={` normal-case text-xs left-10 top-2 text-lime-400`}
							>
								Link Copied!
							</span>
						) : (
							<span className="text-xs text-white">Share</span>
						)}
					</div>
					<div
						className="flex flex-col items-center"
						onClick={onUpvote}
					>
						<BiUpvote
							size={16}
							className={`${
								upvoted ? "text-lime-400" : "text-white"
							}`}
						/>
						<span
							className={`text-xs ${
								upvoted ? "text-lime-400" : "text-white"
							}`}
						>
							{formatter.current.format(upvotes || 0)} upvotes
						</span>
					</div>
					<div
						className="flex flex-col items-center"
						onClick={() => setShowContents((prev) => !prev)}
					>
						<GiHamburgerMenu size={14} className="text-white" />
						<span className="text-xs text-white">Contents</span>
					</div>
				</footer>
			</Layout>
		</>
	);
}

export const getStaticPaths: GetStaticPaths = async () => {
	const { data } = await supabase
		.from<Post>(SUPABASE_POST_TABLE)
		.select("id")
		.limit(5);
	return {
		paths: data?.map((post) => ({ params: { postId: `${post.id}` } })) || [
			{ params: { postId: "69" } },
		],
		fallback: true,
	};
};

export const getStaticProps: GetStaticProps<
	Partial<PublicBlogProps>,
	{ postId: string }
> = async (context) => {
	const { data, error } = await supabase
		.from<PostWithBlogger>(SUPABASE_POST_TABLE)
		.select(
			"id,created_by,title,description,language,published_on,filename,image_folder, bloggers(name)"
		)
		.match({ id: context.params?.postId });

	if (error || !data || data.length == 0) return { props: {}, redirect: "/" };

	const post = data[0];
	const filename = post.filename;
	const { data: fileData, error: fileError } = await supabase.storage
		.from(SUPABASE_FILES_BUCKET)
		.download(filename);

	if (fileError || !fileData) return { props: {}, redirect: "/" };
	const content = (await getHtmlFromMarkdown(fileData)).content;

	return {
		props: {
			...post,
			postId: context.params?.postId,
			content,
		},
	};
};
