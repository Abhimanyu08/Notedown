import {
	Session,
	createServerComponentSupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import React from "react";

async function OwnerOnlyStuff({
	children,
	id,
	session,
}: {
	children: React.ReactNode;
	id: string;
	session: Session | null;
}) {
	if (session?.user.id && session.user.id === id) {
		return <>{children}</>;
	}

	return <></>;
}

export async function NotOwnerOnlyStuff({
	children,
	id,
	session,
}: {
	children: React.ReactNode;
	id: string;
	session: Session | null;
}) {
	if (!session?.user.id || session.user.id !== id) {
		return <>{children}</>;
	}

	return <></>;
}

export default OwnerOnlyStuff;
