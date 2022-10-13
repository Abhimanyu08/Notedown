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
import SmallScreenFooter from "../../components/SmallScreenFooter";

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
	const [upvoted, setUpvoted] = useState<boolean | null>(null);
	const [upvotes, setUpvotes] = useState<number | null>(null);
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

	useEffect(() => {
		if (typeof upvotes !== "number") fetchUpvotes();
		if (user) fetchUpvote();
	}, [user]);

	useEffect(() => {
		if (containerId) {
			window.onbeforeunload = async () => {
				setContainerId(undefined);
				await sendRequestToRceServer("DELETE", { containerId });
			};
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
		if (containerId || !props.language) return;
		try {
			const resp = await sendRequestToRceServer("POST", {
				language: props.language,
			});

			if (resp.status !== 201) {
				console.log(resp.statusText);
				alert("Couldn't set up remote code execution");
				return;
			}
			const body: { containerId: string } = await resp.json();
			setContainerId(body.containerId);
		} catch (_) {
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
				<BlogLayout showContent={showContent}>
					<Toc
						html={props?.content}
						setShowContents={setShowContents}
					/>

					<Blog {...props} containerId={containerId} />

					<>
						{props.language && (
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
										containerId
											? "text-lime-400"
											: "text-white"
									} mt-2 ml-2 `}
								/>
							</div>
						)}

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
					</>
				</BlogLayout>
				<SmallScreenFooter>
					{props.language && (
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
								className={` ${
									containerId ? "text-lime-400" : "text-white"
								} `}
							>
								Activate RCE
							</span>
						</div>
					)}
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
							<span className=" text-white">Share</span>
						)}
					</div>
					<div
						className="flex flex-col items-center"
						onClick={onUpvote}
					>
						<BiUpvote
							size={20}
							className={`${
								upvoted ? "text-lime-400" : "text-white"
							}`}
						/>
						<span
							className={` ${
								upvoted ? "text-lime-400" : "text-white"
							}`}
						>
							{formatter.current.format(upvotes || 0)}{" "}
							{(upvotes || 0) === 1 ? "upvote" : "upvotes"}
						</span>
					</div>
					<div
						className="flex flex-col items-center"
						onClick={() => setShowContents((prev) => !prev)}
					>
						<GiHamburgerMenu size={20} className="text-white" />
						<span className=" text-white">Contents</span>
					</div>
				</SmallScreenFooter>
			</Layout>
		</>
	);
}

export const getStaticPaths: GetStaticPaths = async () => {
	return { paths: [], fallback: true };
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
