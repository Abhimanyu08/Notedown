import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { AiFillRead } from "react-icons/ai";
import { FaPencilAlt } from "react-icons/fa";
import { SUPABASE_FILES_BUCKET } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import AllScreenDemo from "../components/HomePageComponents/AllScreenDemo";
import DonationsComponent from "../components/HomePageComponents/DonationsComponent";
import HeaderText from "../components/HomePageComponents/HeaderText";
import MdToBlog from "../components/HomePageComponents/MdToBlogDemo";
import YoutubeDemoComponent from "../components/HomePageComponents/YoutubeDemoComponent";
import Layout from "../components/Layout";
import YoutubeDemoModal from "../components/Modals/YoutubeDemoModal";
import { UserContext } from "./_app";
// import markdownArray from "../../utils/trialArray";

interface TrialProps {
	markdown: string;
}

function Index({ markdown }: TrialProps) {
	const { user } = useContext(UserContext);
	const router = useRouter();

	return (
		<Layout user={user || null} route={router.asPath}>
			<Head>
				{/* <!-- HTML Meta Tags --> */}
				<title>RCE-Blog</title>
				<meta
					name="description"
					content="Write posts/notes containing prose, executable code snippets, free hand drawings and images."
				/>

				{/* <!-- Facebook Meta Tags --> */}
				<meta property="og:url" content="https://rce-blog.xyz/" />
				<meta property="og:type" content="website" />
				<meta property="og:title" content="RCE-Blog" />
				<meta
					property="og:description"
					content="Write posts/notes containing prose, executable code snippets, free hand drawings and images."
				/>
				<meta
					property="og:image"
					content="https://rce-blog.xyz/api/og"
				/>

				{/* <!-- Twitter Meta Tags --> */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta property="twitter:domain" content="rce-blog.xyz" />
				<meta property="twitter:url" content="https://rce-blog.xyz" />
				<meta name="twitter:title" content="RCE-Blog" />
				<meta
					name="twitter:description"
					content="Write posts/notes containing prose, executable code snippets, free hand drawings and images."
				/>
				<meta
					name="twitter:image"
					content="https://rce-blog.xyz/api/og"
				/>

				{/* <!-- Meta Tags Generated via https://www.opengraph.xyz --> */}
			</Head>
			<YoutubeDemoModal />
			<div
				className="flex gap-10 lg:gap-20 md:gap-14 flex-col pb-20 grow overflow-y-auto
				lg:scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-700
			"
			>
				<div className="self-center flex gap-10 font-semibold lg:text-xl text-black">
					<Link href="/read">
						<div className="cursor-pointer bg-amber-400 flex items-center gap-2 px-3 lg:px-4 py-1 lg:py-2 rounded-md  ">
							Read <AiFillRead size={24} />
						</div>
					</Link>
					<Link href="/edit">
						<div className="cursor-pointer px-3 lg:px-4 py-1 lg:py-2 rounded-md   flex items-center gap-2 bg-amber-400">
							Write <FaPencilAlt />
						</div>
					</Link>
				</div>
				<HeaderText />
				<YoutubeDemoComponent />
				<MdToBlog {...{ markdown }} />
				{/* <WriteEditDemo />
				<CanvasDemo />
				<SearchDemo /> */}
				<AllScreenDemo />
				<DonationsComponent />
			</div>
		</Layout>
	);
}

export const getStaticProps: GetStaticProps<TrialProps> = async ({}) => {
	const { data: fileData, error: fileError } = await supabase.storage
		.from(SUPABASE_FILES_BUCKET)
		.download("f2c61fc8-bcdb-46e9-aad2-99c0608cf485/608/file.md");

	if (fileError || !fileData)
		return { props: { markdown: "" }, redirect: "/" };
	const content = await fileData.text();
	return {
		props: {
			markdown: content,
		},
	};
};

export default Index;
