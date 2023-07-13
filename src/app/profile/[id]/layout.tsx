import { getUser } from "@/app/utils/getData";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import React from "react";
import ProfileControl from "./components/ProfileControl";
import ProfileImageEditor from "./components/ProfileImageEditor";
import { BsPersonCircle } from "react-icons/bs";
import { Metadata } from "next";
import { supabase } from "@utils/supabaseClient";
import { SUPABASE_BLOGGER_TABLE } from "@utils/constants";
import { Sheet, SheetTrigger, SheetContent } from "@components/ui/sheet";
import { RxHamburgerMenu } from "react-icons/rx";
import Link from "next/link";

export async function generateMetadata({
	params,
}: {
	params: { id: string };
}): Promise<Metadata | undefined> {
	const { data } = await supabase
		.from(SUPABASE_BLOGGER_TABLE)
		.select("name, about")
		.eq("id", params.id)
		.single();
	if (!data) return;

	const { name: title, about: description } = data;
	return {
		title,
		description,
		openGraph: {
			title: title!,
			description: description!,
			type: "profile",
			url: `https://rce-blog.xyz/profile/${params.id}`,
		},
		twitter: {
			card: "summary",
			title: title!,
			description: description!,
		},
	};
}

async function ProfileLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { id: string };
}) {
	const userData = await getUser(params.id);

	async function revalidateProfile() {
		"use server";
		revalidatePath("/profile/[id]");
	}
	return (
		<div className="flex">
			<div className="flex flex-col gap-4 h-full justify-start">
				<Link href={`/profile/${params.id}/posts/public`}>
					Public Notes
				</Link>
				<Link href={`/profile/${params.id}/posts/private`}>
					Private Notes
				</Link>
				<Link href={`/profile/${params.id}/posts/drafts`}>Drafts</Link>
			</div>
			{children}
		</div>
	);
}

export default ProfileLayout;
