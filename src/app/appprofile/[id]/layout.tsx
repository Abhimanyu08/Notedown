import { getUser } from "@/app/utils/getData";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import React from "react";
import ProfileControl from "./components/ProfileControl";
import ProfileImageEditor from "./components/ProfileImageEditor";
import { BsPersonCircle } from "react-icons/bs";
import SearchModal from "./posts/components/SearchModal";

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
		revalidatePath("/appprofile/[id]");
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

				<div className="lg:col-span-5 overflow-auto relative">
					{children}
				</div>
			</div>
		</>
	);
}

export default ProfileLayout;
