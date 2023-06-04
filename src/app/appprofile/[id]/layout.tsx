import { getUser } from "@/app/utils/getData";
import Image from "next/image";
import React from "react";
import ProfileControl from "./components/ProfileControl";

async function ProfileLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { id: string };
}) {
	const userData = await getUser(params.id);
	if (!userData) return <></>;

	return (
		<div className="lg:grid flex lg:w-4/6 mx-auto flex-col grow  h-full overflow-y-auto lg:overflow-y-clip lg:grid-cols-7 text-white gap-y-10 pt-10">
			{/* <AboutEditorModal
				about={userData?.about || ""}
				avatarUrl={userData?.avatar_url || ""}
				name={userData!.name!}
			/> */}
			<div className="lg:col-span-2 flex flex-col items-center max-h-full">
				<Image
					src={userData?.avatar_url || ""}
					width={140}
					height={140}
					alt={`Rce-blog profile picture of ${userData?.name}`}
					className="rounded-full"
				/>
				<ProfileControl id={params.id} />
			</div>

			<div className="lg:col-span-5 overflow-auto relative">
				{children}
			</div>
		</div>
	);
}

export default ProfileLayout;
