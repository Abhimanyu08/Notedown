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
		<div className="flex flex-col mx-auto w-[65ch]">
			<div className="flex gap-6 ring-b-gray-600 mt-2 ring-b-[1px] w-fit px-4">
				<div className="">Public</div>
				<div className="border-b-[1px] border-gray-100">Private</div>
				<div className="">Drafts</div>
			</div>
		</div>
	);
}

export default About;
