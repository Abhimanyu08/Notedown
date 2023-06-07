import { Database } from "@/interfaces/supabase";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { headers, cookies } from "next/headers";
import EditorLayout from "./components/EditorLayout";
import { SUPABASE_BLOGGER_TABLE } from "@utils/constants";

async function Write() {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});
	const userId = (await supabase.auth.getUser()).data.user?.id;
	const { data } = await supabase
		.from(SUPABASE_BLOGGER_TABLE)
		.select("name")
		.eq("id", userId)
		.single();

	return <EditorLayout userName={data?.name || ""} />;
}

export default Write;
