import { SUPABASE_BLOGGER_TABLE } from "@utils/constants";
import { createSupabaseServerClient } from "@utils/createSupabaseClients";
import { cookies, headers } from "next/headers";
import Link from "next/link";

async function BlogAuthorServer({ createdBy }: { createdBy: string | null }) {
	// const [author, setAuthor] = useState("");
	// const { session } = useSupabase();

	const supabase = createSupabaseServerClient(cookies);

	const { data } = await supabase.auth.getUser();

	if (data.user?.id === createdBy) {
		return <></>;
	}

	if (createdBy) {
		const { data } = await supabase
			.from(SUPABASE_BLOGGER_TABLE)
			.select("name")
			.eq("id", createdBy)
			.single();
		if (data) {
			return (
				<Link
					href={`/notebook/${createdBy}`}
					className="underline underline-offset-2 hover:italic decoration-black dark:decoration-gray-400"
				>
					{data.name || "Anon"}
				</Link>
			);
		}
	}
	return <></>;
}

export default BlogAuthorServer;
