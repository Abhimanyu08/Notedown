import { getUser } from "@utils/getData";
import { Metadata } from "next";
import React from "react";

type LayoutProps = {
	children: React.ReactNode;
	params: { id: string };
};

export async function generateMetadata({
	params,
}: LayoutProps): Promise<Metadata | undefined> {
	if (params.id === "anon") return;
	let name = (await getUser(params.id))?.name;

	return {
		title: name,
		description: `${name || "Anon"}'s public notes`,
		openGraph: {
			title: name || "Anon",
			description: `${name || "Anon"}'s public notes`,
			type: "article",
			url: `https://notedown.art/notebook/${params.id}`,
		},
		twitter: {
			card: "summary",
			title: name || "Anon",
			description: `${name || "Anon"}'s public notes`,
		},
	};
}

async function ProfilePostsLayout({ children }: LayoutProps) {
	return (
		<>
			<div className="grid grid-cols-10 w-full h-screen grid-rows-1 ">
				{children}
			</div>
		</>
	);
}

export default ProfilePostsLayout;
