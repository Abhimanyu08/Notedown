import { getUser } from "@/app/utils/getData";
// import { supabase } from "@/utils/constants";
import EditorContextProvider from "@/app/appwrite/components/EditorContext";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SUPABASE_BLOGGER_TABLE } from "@utils/constants";
import mdToHtml from "@utils/mdToHtml";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import AboutEditor from "./components/AboutEditor";
import AboutJsxWrapper from "./components/AboutJsxWrapper";

async function About({ params }: { params: { id: string } }) {
	const userData = await getUser(params.id);
	const aboutHtml = await mdToHtml(userData?.about || "");

	async function changeAbout(about: string) {
		"use server";
		const supabase = createServerComponentSupabaseClient({
			headers,
			cookies,
		});
		const { data } = await supabase.auth.getUser();
		if (data.user?.id) {
			await supabase
				.from(SUPABASE_BLOGGER_TABLE)
				.update({
					about,
				})
				.eq("id", data.user?.id);
			revalidatePath("/appprofile/[id]");
		}
	}

	return (
		<EditorContextProvider>
			<div className="flex flex-col w-full relative h-full">
				<h1 className="text-3xl tracking-normal mb-10">
					{userData?.name}
				</h1>
				<AboutJsxWrapper html={aboutHtml} />
				<AboutEditor
					aboutHtml={aboutHtml}
					aboutMarkdown={userData?.about || ""}
					changeAbout={changeAbout}
				/>
			</div>
		</EditorContextProvider>
	);
}

export default About;
