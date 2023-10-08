"use client";
import { useSupabase } from "@/app/appContext";
import { SUPABASE_BLOGGER_TABLE } from "@utils/constants";
import Link from "next/link";
import React, { memo, useEffect, useState } from "react";

function BlogAuthorClient() {
	const { session, supabase } = useSupabase();
	const [author, setAuthor] = useState("Anon");
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
	}, [session]);

	if (session) {
		return (
			<Link
				href={`/profile/${session.user.id}`}
				className="underline underline-offset-2 hover:italic decoration-black dark:decoration-gray-400"
			>
				{author}
			</Link>
		);
	}
	return <></>;
}

export default memo(BlogAuthorClient);
