import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Blog } from "../../components/Blog";
import Layout from "../../components/Layout";
import usePrivatePostQuery from "../../hooks/usePrivatePost";
import { UserContext } from "../_app";

export default function PrivateBlog() {
	const router = useRouter();
	const { privatePostId } = router.query;
	const { user } = useContext(UserContext);
	const { data, error, loading } = usePrivatePostQuery({
		postId: parseInt(privatePostId as string),
		loggedInUser: user || null,
	});
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

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
		console.log("rendering this");
		return (
			<Layout user={user || null} route={"/"} logoutCallback={() => null}>
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
		<>
			<Layout
				user={user || null}
				route={router.asPath}
				logoutCallback={() => null}
			>
				<Blog {...data} />
			</Layout>
		</>
	);
}
