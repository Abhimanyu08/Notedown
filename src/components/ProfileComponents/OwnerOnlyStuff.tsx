import { createSupabaseServerClient } from "@utils/createSupabaseClients";
import { cookies, headers } from "next/headers";
import React from "react";

async function OwnerOnlyStuff({
	children,
	id,
}: {
	children: React.ReactNode;
	id: string;
}) {
	const supabase = createSupabaseServerClient(cookies);
	const {
		data: { session },
	} = await supabase.auth.getSession();
	if (session?.user.id && session.user.id === id) {
		return <>{children}</>;
	}

	return <></>;
}

export async function NotOwnerOnlyStuff({
	children,
	id,
}: {
	children: React.ReactNode;
	id: string;
}) {
	const supabase = createSupabaseServerClient(cookies);
	const {
		data: { session },
	} = await supabase.auth.getSession();
	if (!session?.user.id || session.user.id !== id) {
		return <>{children}</>;
	}

	return <></>;
}

export default OwnerOnlyStuff;
