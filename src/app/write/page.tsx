import { Database } from "@/interfaces/supabase";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { headers, cookies } from "next/headers";
import EditorLayout from "./components/EditorLayout";
import { SUPABASE_BLOGGER_TABLE } from "@utils/constants";

async function Write() {
	return <EditorLayout />;
}

export default Write;
