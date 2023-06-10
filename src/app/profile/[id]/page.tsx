import { getUser } from "@/app/utils/getData";
// import { supabase } from "@/utils/constants";
import EditorContextProvider from "@/app/write/components/EditorContext";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SUPABASE_BLOGGER_TABLE } from "@utils/constants";
import mdToHtml from "@utils/mdToHtml";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import AboutEditor from "./components/AboutEditor";
import AboutJsxWrapper from "./components/AboutJsxWrapper";
import { AiFillEdit } from "react-icons/ai";

async function About({ params }: { params: { id: string } }) {
	const userData = await getUser(params.id);
	const aboutHtml = await mdToHtml(userData?.about || "");

	async function changeAbout(name: string, about: string) {
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
					name,
					about,
				})
				.eq("id", data.user?.id);
			revalidatePath("/profile/[id]");
		}
	}

	return (
		<EditorContextProvider>
			<div className="flex flex-col w-full relative h-full pl-1">
				<h1 className="text-3xl tracking-normal mb-10">
					{userData?.name}
				</h1>
				<AboutJsxWrapper html={aboutHtml} />

				{/* <label
					className="absolute top-2 right-2 dark:bg-gray-800 p-2 rounded-full tooltip tooltip-bottom"
					data-tip="edit"
					htmlFor="edit-about"
				>
					<AiFillEdit size={14} />
				</label> */}
				<AboutEditor
					name={userData?.name || ""}
					aboutHtml={aboutHtml}
					aboutMarkdown={userData?.about || ""}
					changeAbout={changeAbout}
				/>
			</div>
		</EditorContextProvider>
	);
}

export default About;
