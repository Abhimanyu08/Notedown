import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { SUPABASE_FILES_BUCKET } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Layout from "../components/Layout";
import AllScreenDemo from "../components/TrialPageComponents/AllScreenDemo";
import CanvasDemo from "../components/TrialPageComponents/CanvasDemo";
import HeaderText from "../components/TrialPageComponents/HeaderText";
import MdToBlog from "../components/TrialPageComponents/MdToBlog";
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
			<div className="flex gap-20 flex-col pb-20 grow overflow-y-auto">
				<HeaderText />
				<MdToBlog {...{ markdown }} />
				<WriteEditDemo />
				<CanvasDemo />
				<AllScreenDemo />
				<SearchDemo />
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
