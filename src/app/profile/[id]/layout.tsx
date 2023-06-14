import { getUser } from "@/app/utils/getData";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import React from "react";
import ProfileControl from "./components/ProfileControl";
import ProfileImageEditor from "./components/ProfileImageEditor";
import { BsPersonCircle } from "react-icons/bs";
import SearchModal from "./posts/components/SearchModal";
import { Metadata } from "next";
import { supabase } from "@utils/supabaseClient";
import { SUPABASE_BLOGGER_TABLE } from "@utils/constants";

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
	if (!userData) return <></>;

	async function revalidateProfile() {
		"use server";
		revalidatePath("/profile/[id]");
	}
	return (
		<>
			<SearchModal />
			<div className="lg:grid flex lg:w-4/6 mx-auto flex-col grow  h-full overflow-y-auto lg:overflow-y-clip lg:grid-cols-7 text-white gap-y-10 pt-10">
				{/* <AboutEditorModal
				about={userData?.about || ""}
				avatarUrl={userData?.avatar_url || ""}
				name={userData!.name!}
			/> */}
				<div className="lg:col-span-2 flex flex-col items-center max-h-full relative">
					<div className="w-[140px] h-[140px] relative">
						{userData.avatar_url ? (
							<Image
								src={userData?.avatar_url || ""}
								fill={true}
								alt={`Rce-blog profile picture of ${userData?.name}`}
								className="rounded-full"
							/>
						) : (
							<BsPersonCircle className="w-[140px] h-[140px] text-gray-500" />
						)}
					</div>
					<ProfileImageEditor revalidateProfile={revalidateProfile} />
					<ProfileControl id={params.id} />
				</div>

				<div className="lg:col-span-5 overflow-auto relative pr-10">
					{children}
				</div>
			</div>
		</>
	);
}

export default ProfileLayout;
