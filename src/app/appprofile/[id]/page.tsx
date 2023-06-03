import { getUser } from "@/app/utils/getData";
// import { supabase } from "@/utils/constants";
import EditorContextProvider from "@/app/appwrite/components/EditorContext";
import mdToHtml from "@utils/mdToHtml";
import AboutEditor from "./components/AboutEditor";
import AboutJsxWrapper from "./components/AboutJsxWrapper";

async function About({ params }: { params: { id: string } }) {
	const userData = await getUser(params.id);
	const aboutHtml = await mdToHtml(userData?.about || "");

	return (
		<EditorContextProvider>
			<div className="flex flex-col w-full relative h-full">
				<h1 className="text-3xl tracking-normal">{userData?.name}</h1>
				<AboutJsxWrapper html={aboutHtml} />
				<AboutEditor
					aboutHtml={aboutHtml}
					aboutMarkdown={userData?.about || ""}
				/>
			</div>
		</EditorContextProvider>
	);
}

export default About;
