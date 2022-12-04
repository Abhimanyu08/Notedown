import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { BiCodeAlt } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";
import { TbNews } from "react-icons/tb";
import { sendRequestToRceServer } from "../../../utils/sendRequest";
import { Blog } from "../../components/BlogPostComponents/Blog";
import BlogLayout from "../../components/BlogPostComponents/BlogLayout";
import { Toc } from "../../components/BlogPostComponents/TableOfContents";
import Layout from "../../components/Layout";
import { PublishModal } from "../../components/Modals/PublishModal";
import SmallScreenFooter from "../../components/SmallScreenFooter";
import { PostContext } from "../../Contexts/PostContext";
import usePrivatePostQuery from "../../hooks/usePrivatePost";
import { UserContext } from "../_app";

export default function PrivateBlog() {
	const router = useRouter();
	const { postId } = router.query;
	const { user } = useContext(UserContext);
	const { data, error, loading } = usePrivatePostQuery({
		postId: parseInt(postId as string),
		loggedInUser: user || null,
	});
	const [showContent, setShowContents] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [containerId, setContainerId] = useState<string>();

	const { setPrivatePosts } = useContext(PostContext);

	useEffect(() => {
		if (!user) router.replace("/");
		if (!mounted) setMounted(true);
	}, []);

	useEffect(() => {
		if (containerId) {
			window.onbeforeunload = async () =>
				await sendRequestToRceServer("DELETE", { containerId });
		}
		return () => {
			if (containerId) sendRequestToRceServer("DELETE", { containerId });
		};
	}, [containerId]);

	const prepareContainer = async () => {
		if (!user) return;
		if (containerId) return;
		try {
			const resp = await sendRequestToRceServer("POST", {
				language: data?.language || "",
			});

			if (resp.status !== 201) {
				alert(
					`Couldn't set up remote code execution, ${resp.statusText}`
				);
				return;
			}
			const body: { containerId: string } = await resp.json();
			setContainerId(body.containerId);
		} catch (_) {
			alert("Couldn't enable remote code execution");
		}
	};

	if (!mounted) {
		return null;
	}
	if (error) {
		return (
			<Layout user={user || null} route={"/"} logoutCallback={() => null}>
				<p>Error in fetching post {error.message}</p>
			</Layout>
		);
	}

	if (loading) {
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

	return (
		<Layout
			user={user || null}
			route={router.asPath}
			logoutCallback={() => null}
		>
			{data ? (
				<PublishModal
					post={data}
					afterActionCallback={(newPost) => {
						setPrivatePosts((prev) => [newPost, ...prev]);
					}}
				/>
			) : (
				<></>
			)}

			<BlogLayout showContent={showContent}>
				<Toc html={data?.content} setShowContents={setShowContents} />

				<Blog
					{...data}
					containerId={containerId}
					paddingClasses="px-2 lg:px-20"
				/>
				<>
					{data?.language && (
						<div
							className={` btn btn-circle  btn-ghost tooltip`}
							data-tip="Activate remote code execution"
							onClick={prepareContainer}
						>
							<BiCodeAlt
								size={30}
								className={` ${
									containerId ? "text-lime-400" : "text-white"
								} mt-2 ml-2 `}
							/>
						</div>
					)}
					<div
						className="btn btn-circle btn-ghost tooltip"
						data-tip={"Edit Markdown"}
						onClick={() => router.push(`/edit?postId=${postId}`)}
					>
						<AiFillEdit
							size={28}
							className="text-white mt-2 ml-2"
						/>
					</div>
					<label
						htmlFor={`publish`}
						className="md:tooltip-left md:tooltip capitalize btn btn-circle btn-ghost"
						data-tip="publish"
					>
						<TbNews className="ml-2 mt-2 text-white" size={30} />
					</label>
				</>
			</BlogLayout>
			<SmallScreenFooter>
				{data?.language ? (
					<div
						className="flex flex-col items-center text-white gap-1"
						onClick={prepareContainer}
					>
						<BiCodeAlt
							size={22}
							className={` ${
								containerId ? "text-lime-400" : "text-white"
							}`}
						/>
						<span className="text-xs">Activate RCE</span>
					</div>
				) : (
					<></>
				)}

				<div
					className="flex flex-col items-center text-white gap-1"
					onClick={() => router.push(`/edit?postId=${postId}`)}
				>
					<AiFillEdit size={20} className="text-white" />
					<span className="text-xs">Edit</span>
				</div>

				<label
					htmlFor={`publish`}
					className="flex flex-col items-center text-white gap-1"
					data-tip="publish"
				>
					<TbNews className="ml-2 mt-2 text-white" size={20} />
					<span className="text-xs">Publish</span>
				</label>
				<div
					className="flex flex-col items-center gap-1 text-white"
					onClick={() => setShowContents((prev) => !prev)}
				>
					<GiHamburgerMenu size={20} />
					<span className="text-xs">Contents</span>
				</div>
			</SmallScreenFooter>
		</Layout>
	);
}
