import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { BiCodeAlt, BiUpvote } from "react-icons/bi";
import { IoMdShareAlt } from "react-icons/io";
import sendRequest from "../../../../utils/sendRequest";
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
	const [mounted, setMounted] = useState(false);
	const [containerId, setContainerId] = useState<string>();
	const [connecting, setConnecting] = useState(false);

	useEffect(() => {
		if (!user) router.replace("/");
		if (data) {
			if (data.created_by !== user?.id) router.replace("/");
		}

		setMounted(true);
	}, [data]);

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
	const prepareContainer = async () => {
		if (!user) return;
		if (containerId) return;
		setConnecting(true);
		try {
			const resp = await sendRequest("POST", {
				language: data?.language || "",
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
	if (loading) {
		console.log("rendering this");
		return (
			<Layout user={user || null} route={"/"} logoutCallback={() => null}>
				<div>
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
				<div className="basis-1/5 flex flex-col justify-center">
					<Toc html={data?.content} />
				</div>
				<Blog {...data} />
				<div className="flex flex-col basis-1/5 w-fit justify-center pl-5 gap-4">
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
						data-tip="Upvote"
					>
						<BiUpvote size={30} className="text-white mt-2 ml-2" />
					</div>
				</div>
			</BlogLayout>
		</Layout>
	);
}
