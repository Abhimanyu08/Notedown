import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import React from "react";

async function OwnerOnlyStuff({
	children,
	id,
}: {
	children: React.ReactNode;
	id: string;
}) {
	const supabase = createServerComponentSupabaseClient({
		headers,
		cookies,
	});

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (session?.user.id && session.user.id === id) {
		return <>{children}</>;
	}

	return <></>;
}

export default OwnerOnlyStuff;
