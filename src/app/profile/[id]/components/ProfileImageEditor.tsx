"use client";
import { useSupabase } from "@/app/appContext";
import {
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_IMAGE_BUCKET,
} from "@utils/constants";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { BiCheck, BiImageAdd } from "react-icons/bi";
import { BsPersonCircle } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
import { VscLoading } from "react-icons/vsc";

function ProfileImageEditor({
	revalidateProfile,
}: // changeProfileImage,
{
	// changeProfileImage: (profileImage: File | null) => Promise<void>;
	revalidateProfile: () => Promise<void>;
}) {
	const [profileImage, setProfileImage] = useState<File | null>();
	const [changeState, setChangeState] = useState<
		"deleted" | "added picture" | null
	>(null);
	const [changing, setChanging] = useState(false);
	const [owner, setOwner] = useState(false);
	const pathname = usePathname();
	const { session, supabase } = useSupabase();
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		setOwner(
			!!(session?.user && pathname?.split("/").at(2) === session.user.id)
		);
	}, [session]);
	if (!owner) {
		return <></>;
	}
	async function changeProfileImage() {
		setChanging(true);
		const { data } = await supabase.auth.getUser();
		if (!data.user?.id) return;
		const folderName = data.user.id + "/" + "AVATAR";
		const { data: previousData } = await supabase.storage
			.from(SUPABASE_IMAGE_BUCKET)
			.list(folderName);
		if (previousData?.length === 1) {
			await supabase.storage
				.from(SUPABASE_IMAGE_BUCKET)
				.remove([`${folderName}/${previousData.at(0)?.name}`]);
		}
		if (profileImage === null) {
			await supabase
				.from(SUPABASE_BLOGGER_TABLE)
				.update({
					avatar_url: null,
				})
				.eq("id", data.user.id);
		}

		if (profileImage) {
			// upload new profile image
			const newImagePath = `${folderName}/${profileImage.name}`;
			await supabase.storage
				.from(SUPABASE_IMAGE_BUCKET)
				.upload(newImagePath, profileImage);
			const { publicUrl } = supabase.storage
				.from(SUPABASE_IMAGE_BUCKET)
				.getPublicUrl(newImagePath).data;

			await supabase
				.from(SUPABASE_BLOGGER_TABLE)
				.update({
					avatar_url: publicUrl,
				})
				.eq("id", data.user.id);
		}
	}
	return (
		<>
			<input
				type="file"
				id="profile"
				accept="image/*"
				className="hidden"
				onChange={(e) => {
					setChangeState("added picture");
					setProfileImage(e.target.files?.item(0));
				}}
				ref={inputRef}
			/>
			{changeState === "added picture" && profileImage && (
				<div className="absolute w-[140px] h-[140px] rounded-full overflow-hidden">
					<Image
						src={URL.createObjectURL(profileImage)}
						fill={true}
						alt=""
					/>
				</div>
			)}
			{changeState === "deleted" && (
				<div className="bg-black absolute">
					<BsPersonCircle className="w-[140px] h-[140px] text-gray-500" />
				</div>
			)}
			<div className="absolute opacity-0 hover:opacity-100 flex items-center justify-center gap-3 bg-black/50 w-[140px] h-[140px]">
				{changeState !== null ? (
					<>
						<button
							className="dark:hover:bg-gray-800/50 p-2 rounded-full tooltip tooltip-bottom "
							data-tip="Save"
							onClick={() => {
								changeProfileImage()
									.then(revalidateProfile)
									.then(() => {
										if (inputRef.current) {
											inputRef.current.files = null;
										}
										setChangeState(null);
										setProfileImage(null);
										setChanging(false);
									});
							}}
						>
							{changing ? (
								<VscLoading className="animate-spin" />
							) : (
								<BiCheck size={14} />
							)}
						</button>
						<button
							className="dark:hover:bg-gray-800/50 p-2 rounded-full tooltip tooltip-bottom "
							data-tip="Cancel"
							onClick={() => setChangeState(null)}
						>
							<IoMdClose size={20} />
						</button>
					</>
				) : (
					<>
						<button
							className="dark:hover:bg-gray-800/50 p-2 rounded-full tooltip tooltip-bottom tooltip-left"
							data-tip="Add/Change Image"
						>
							<label htmlFor="profile">
								<BiImageAdd size={20} />
							</label>
						</button>
						<button
							className="dark:hover:bg-gray-800/50 p-2 rounded-full tooltip tooltip-bottom tooltip-left"
							data-tip="Delete Image"
							onClick={() => setChangeState("deleted")}
						>
							<MdDeleteOutline size={20} />
						</button>
					</>
				)}
			</div>
		</>
	);
}

export default ProfileImageEditor;
