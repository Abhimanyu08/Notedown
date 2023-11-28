import {
	LoggedInOptions,
	NotLoggedInOptions,
} from "@components/Navbar/Options";
import PostPreviewLayout from "@components/ProfileComponents/PostPreviewLayout";
import SideSheet from "@components/SideSheet";
import { getUser } from "@utils/getData";
import { Metadata } from "next";
import React from "react";

type LayoutProps = {
	children: React.ReactNode;
	postpreview: React.ReactNode;
	params: { id: string };
};

export async function generateMetadata({
	params,
}: LayoutProps): Promise<Metadata | undefined> {
	if (params.id === "anon") return;
	let { name } = (await getUser(params.id))!;

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

async function ProfilePostsLayout({
	children,
	postpreview,
	params,
}: LayoutProps) {
	console.log("Post preview type ======================>", params);
	return (
		<>
			<div className="grid grid-cols-10 w-full h-screen grid-rows-1 ">
				<div className="flex flex-col col-span-3 row-span-1 pt-6 border-r-[1px] border-border">
					{children}
				</div>

				<div
					className="col-span-7 h-full row-span-1 pt-10 relative  
				overflow-y-auto
		lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
				scroll-smooth
	
				"
				>
					{postpreview}
				</div>
			</div>
		</>
	);
}

export default ProfilePostsLayout;
