import { GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { AiFillRead } from "react-icons/ai";
import { FaPencilAlt } from "react-icons/fa";
import { SUPABASE_FILES_BUCKET } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Layout from "../components/Layout";
import AllScreenDemo from "../components/TrialPageComponents/AllScreenDemo";
import CanvasDemo from "../components/TrialPageComponents/CanvasDemo";
import HeaderText from "../components/TrialPageComponents/HeaderText";
import MdToBlog from "../components/TrialPageComponents/MdToBlogDemo";
import SearchDemo from "../components/TrialPageComponents/SearchDemo";
import WriteEditDemo from "../components/TrialPageComponents/WriteEditDemo";
import { UserContext } from "./_app";
// import markdownArray from "../../utils/trialArray";

interface TrialProps {
	markdown: string;
}

function Trial({ markdown }: TrialProps) {
	const { user } = useContext(UserContext);
	const router = useRouter();

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("opaque");
						return;
					}
					// entry.target.classList.remove('opaque')
				});
			},
			{ threshold: 0.5 }
		);
		const transparentElements = document.querySelectorAll(".transparent");
		transparentElements.forEach((el) => observer.observe(el));
	}, []);

	return (
		<Layout user={user || null} route={router.asPath}>
			<div className="flex gap-10 lg:gap-20 md:gap-14 flex-col pb-20 grow overflow-y-auto">
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
				<MdToBlog {...{ markdown }} />
				<WriteEditDemo />
				<CanvasDemo />
				<SearchDemo />
				<AllScreenDemo />
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

export default Trial;
