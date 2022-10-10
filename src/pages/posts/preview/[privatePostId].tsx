import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { BiCodeAlt } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";
import { sendRequestToRceServer } from "../../../../utils/sendRequest";
import { Blog } from "../../../components/Blog";
import BlogLayout from "../../../components/BlogLayout";
import Layout from "../../../components/Layout";
import { Toc } from "../../../components/TableOfContents";
import usePrivatePostQuery from "../../../hooks/usePrivatePost";
import { UserContext } from "../../_app";

export default function PrivateBlog() {
	const router = useRouter();
	const { privatePostId } = router.query;
	const { user } = useContext(UserContext);
	const { data, error, loading } = usePrivatePostQuery({
		postId: parseInt(privatePostId as string),
		loggedInUser: user || null,
	});
	const [showContent, setShowContents] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [containerId, setContainerId] = useState<string>();

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
			<BlogLayout>
				<div
					className={` lg:basis-1/5 lg:flex lg:flex-col lg:justify-center ${
						showContent ? "w-screen" : "hidden"
					}`}
				>
					<Toc
						html={data?.content}
						setShowContents={setShowContents}
					/>
				</div>
				<div
					className={`lg:basis-3/5 relative ${
						showContent ? "hidden" : "w-screen"
					}`}
				>
					<Blog {...data} containerId={containerId} />
				</div>
				<div className="hidden lg:flex lg:flex-col basis-1/5 w-fit mt-44 pl-5 gap-6 z-20">
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
					<div
						className="btn btn-circle btn-ghost tooltip"
						data-tip={"Edit Markdown"}
						onClick={() =>
							router.push(`/edit?postId=${privatePostId}`)
						}
					>
						<AiFillEdit
							size={28}
							className="text-white mt-2 ml-2"
						/>
					</div>
				</div>
			</BlogLayout>
			<footer className="w-full flex items-end lg:hidden justify-between md:justify-evenly py-3 px-4  sticky bottom-0 left-0 bg-slate-800 border-t-2 border-white/25 z-50">
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

				<div
					className="flex flex-col items-center text-white gap-1"
					onClick={() => router.push(`/edit?postId=${privatePostId}`)}
				>
					<AiFillEdit size={20} className="text-white" />
					<span className="text-xs">Edit</span>
				</div>

				<div
					className="flex flex-col items-center gap-1 text-white"
					onClick={() => setShowContents((prev) => !prev)}
				>
					<GiHamburgerMenu size={20} />
					<span className="text-xs">Contents</span>
				</div>
			</footer>
		</Layout>
	);
}
