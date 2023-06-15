"use client";
import { useSupabase } from "@/app/appContext";
import { SUPABASE_BLOGGER_TABLE } from "@utils/constants";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function BlogAuthorClient() {
	const { session, supabase } = useSupabase();
	const [author, setAuthor] = useState("");
	useEffect(() => {
		const userId = session?.user.id;
		if (!userId) return;

		supabase
			.from(SUPABASE_BLOGGER_TABLE)
			.select("name")
			.eq("id", userId)
			.single()
			.then((val) => {
				setAuthor(val.data?.name || "");
			});
	}, [session?.user.id]);

	return <Link href={`/profile/${session?.user.id}`}>{author}</Link>;
}

export default BlogAuthorClient;
