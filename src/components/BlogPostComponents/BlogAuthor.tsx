"use client";
import { useSupabase } from "@/app/appContext";
import { SUPABASE_BLOGGER_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function BlogAuthor({ createdBy }: { createdBy: string | null }) {
	const [author, setAuthor] = useState("");
	const { session } = useSupabase();

	useEffect(() => {
		const userId = createdBy || session?.user.id;
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

	return (
		<Link href={`/profile/${createdBy || session?.user.id}`}>{author}</Link>
	);
}

export default BlogAuthor;
