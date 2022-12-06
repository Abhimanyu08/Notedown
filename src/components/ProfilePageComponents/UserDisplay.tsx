import { User } from "@supabase/supabase-js";
import Image from "next/image";
import { useRef, useState } from "react";
import {
	AiFillDelete,
	AiFillEdit,
	AiOutlineGithub,
	AiOutlineLink,
	AiOutlineTwitter,
} from "react-icons/ai";
import { IconType } from "react-icons/lib";
import { IoPersonCircle, IoPersonCircleOutline } from "react-icons/io5";
import {
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_IMAGE_BUCKET,
} from "../../../utils/constants";
import { makeFolderName } from "../../../utils/makeFolderName";
import { sendRevalidationRequest } from "../../../utils/sendRequest";
import { supabase } from "../../../utils/supabaseClient";
import Blogger from "../../interfaces/Blogger";
interface UserDisplayProps {
	profile: Partial<Blogger>;
	user: User | null;
}

function UserDisplay({ profile, user }: UserDisplayProps) {
	const [editing, setEditing] = useState(false);
	const [newPic, setNewPic] = useState<File | null>(null);
	const [currProfile, setCurrProfile] = useState(profile);
	const [uploadingChanges, setUploadingChanges] = useState(false);
	const [deleteProfilePicture, setDeleteProfilePicture] = useState(false);
	const [showProfileChangeButtons, setShowProfileChangeButtons] =
		useState(false);

	const onSave = async () => {
		if (!profile) return;
		setUploadingChanges(true);
		let changes: Partial<Blogger> = {};
		Object.keys(currProfile).forEach((key) => {
			if (
				profile[key as keyof Blogger] !==
				currProfile[key as keyof Blogger]
			) {
				changes[key as keyof Blogger] =
					currProfile[key as keyof Blogger];
			}
		});

		if (currProfile?.name && currProfile.name !== profile?.name) {
			changes["name"] = currProfile.name;
		}
		const { data, error } = await supabase.storage
			.from(SUPABASE_IMAGE_BUCKET)
			.list(makeFolderName(profile.id!, "AVATAR"));

		if (deleteProfilePicture) {
			await supabase.storage
				.from(SUPABASE_IMAGE_BUCKET)
				.remove([
					makeFolderName(profile.id!, `AVATAR/${data?.at(0)?.name}`),
				]);
			changes["avatar_url"] = "";
		}
		if (newPic) {
			if (error || !data) {
				const imagePath = makeFolderName(
					profile?.id!,
					`AVATAR/${newPic.name}`
				);
				await supabase.storage
					.from(SUPABASE_IMAGE_BUCKET)
					.upload(imagePath, newPic);
				const { publicURL } = supabase.storage
					.from(SUPABASE_IMAGE_BUCKET)
					.getPublicUrl(imagePath);
				if (publicURL) {
					changes["avatar_url"] = publicURL;
				}
			} else {
				await supabase.storage
					.from(SUPABASE_IMAGE_BUCKET)
					.remove([
						makeFolderName(
							profile.id!,
							`AVATAR/${data.at(0)?.name}`
						),
					]);
				const imagePath = makeFolderName(
					profile?.id!,
					`AVATAR/${newPic.name}`
				);
				await supabase.storage
					.from(SUPABASE_IMAGE_BUCKET)
					.upload(imagePath, newPic);
				const { publicURL } = supabase.storage
					.from(SUPABASE_IMAGE_BUCKET)
					.getPublicUrl(imagePath);
				if (publicURL) {
					changes["avatar_url"] = publicURL;
				}
			}
		}

		console.log(changes);

		const { data: updatedData } = await supabase
			.from<Blogger>(SUPABASE_BLOGGER_TABLE)
			.update(changes)
			.eq("id", profile.id!);

		setUploadingChanges(false);
		sendRevalidationRequest(`profile/${profile.id}`);
		if (updatedData) setCurrProfile(updatedData.at(0)!);
		setEditing(false);
	};

	if (!currProfile) {
		return <></>;
	}
	return (
		<div className="flex flex-col items-center lg:items-start gap-2 w-full lg:w-40 h-3/4 relative">
			{profile &&
				profile.id &&
				user &&
				user.id &&
				profile.id === user.id && (
					<div
						className="absolute top-0 right-0 lg:hidden text-black dark:text-white"
						onClick={() => setEditing(true)}
					>
						<AiFillEdit />
					</div>
				)}
			<div className="avatar ">
				{editing && (
					<span
						className={`w-full h-full absolute opacity-100 lg:opacity-0 hover:lg:opacity-100 rounded-full flex gap-2 
						items-center justify-center ${showProfileChangeButtons ? "" : "opacity-0"}
					z-50`}
						onTouchStart={() =>
							setShowProfileChangeButtons((prev) => !prev)
						}
					>
						<label
							className="btn btn-xs btn-circle text-white"
							htmlFor="dp"
						>
							<AiFillEdit />
						</label>
						<input
							type="file"
							name=""
							id="dp"
							max={1}
							accept="image/*"
							className="hidden"
							onChange={(e) => {
								if (e.target.files?.item(0)) {
									setDeleteProfilePicture(false);
									setNewPic(e.target.files.item(0));
									const avatarUrl = (
										window.URL || window.webkitURL
									).createObjectURL(e.target.files.item(0)!);

									setCurrProfile((prev) => ({
										...prev,
										avatar_url: avatarUrl,
									}));
								}
							}}
						/>
						<span
							className="btn btn-xs btn-circle text-white"
							onClick={() => {
								setNewPic(null);

								if (
									currProfile.avatar_url ===
									profile.avatar_url
								) {
									//user wants to delete his profile picture
									setDeleteProfilePicture(true);
									setCurrProfile((prev) => ({
										...prev,
										avatar_url: undefined,
									}));
									return;
								}
								setCurrProfile((prev) => ({
									...prev,
									avatar_url: profile.avatar_url,
								}));
							}}
						>
							<AiFillDelete />
						</span>
					</span>
				)}
				<div className={`rounded-full`}>
					<>
						{currProfile.avatar_url ? (
							<Image
								src={currProfile.avatar_url}
								width={160}
								height={160}
								layout="intrinsic"
								objectFit="contain"
							/>
						) : (
							<IoPersonCircleOutline className="w-40 h-40 text-gray-400" />
						)}
					</>
				</div>
			</div>

			{editing ? (
				<div className="flex flex-col gap-2 items-start">
					<input
						type="text"
						name=""
						id="name"
						className="input input-xs bg-white text-black"
						value={currProfile?.name}
						onChange={(e) =>
							setCurrProfile((prev) => ({
								...prev,
								name: e.target.value,
							}))
						}
					/>
					<input
						type="text"
						name=""
						id=""
						className="input input-xs bg-white text-black"
						placeholder="Add twitter username"
						value={currProfile?.twitter}
						onChange={(e) =>
							setCurrProfile((prev) => ({
								...prev,
								twitter: e.target.value,
							}))
						}
					/>
					<input
						type="text"
						name=""
						id=""
						className="input input-xs bg-white text-black"
						placeholder="Add github username"
						value={currProfile?.github}
						onChange={(e) =>
							setCurrProfile((prev) => ({
								...prev,
								github: e.target.value,
							}))
						}
					/>
					<input
						type="text"
						name=""
						id=""
						className="input input-xs bg-white text-black"
						placeholder="Add website link"
						value={currProfile.web}
						onChange={(e) =>
							setCurrProfile((prev) => ({
								...prev,
								web: e.target.value,
							}))
						}
					/>
				</div>
			) : (
				<div className="flex flex-col gap-4 items-center w-full text-black dark:text-white">
					<h1 className={` text-xs font-bold md:text-lg`}>
						{currProfile.name}
					</h1>
					<div className="flex lg:flex-col w-full lg:w-fit mx-2 items-center justify-center gap-4">
						{currProfile.twitter && (
							<Links
								badge={AiOutlineTwitter}
								label={currProfile.twitter}
								// label="lakjdfhaksjhdfaskjdfhaskldjfhaskdjhfasdkfhj"
								link={`https://twitter.com/${currProfile.twitter}`}
							/>
						)}
						{currProfile.github && (
							<Links
								badge={AiOutlineGithub}
								label={currProfile.github}
								link={`https://github.com/${currProfile.github}`}
							/>
						)}
						{currProfile.web && (
							<Links
								badge={AiOutlineLink}
								label={currProfile.web}
								link={currProfile.web}
							/>
						)}
					</div>
				</div>
			)}
			{(user?.id || null) === profile?.id &&
				(editing ? (
					<div className="flex gap-1 justify-center w-full">
						<div
							className={` profile-tool dark:profile-tool-dark text-xs px-2 py-1 rounded-md normal-case md:mt-10  ${
								uploadingChanges ? "loading" : ""
							}`}
							onClick={onSave}
						>
							Save
						</div>
						<div
							className=" profile-tool dark:profile-tool-dark text-xs px-2 py-1 rounded-md normal-case md:mt-10 "
							onClick={() => {
								setEditing(false);
								setCurrProfile(profile);
							}}
						>
							Cancel
						</div>
					</div>
				) : (
					<div className="lg:flex w-full justify-center hidden">
						<div
							className="profile-tool shadow-sm dark:shadow-white/40 shadow-black dark:profile-tool-dark  text-xs font-semibold rounded-md px-2 py-1  normal-case w-fit md:mt-10 "
							onClick={() => setEditing((prev) => !prev)}
						>
							Edit Profile
						</div>
					</div>
				))}
		</div>
	);
}

function Links({
	badge,
	label,
	link,
}: {
	badge: IconType;
	label: string;
	link: string;
}) {
	return (
		<a
			className="flex gap-1 w-1/3 md:w-fit self-center"
			href={link}
			target="_blank"
			rel="noreferrer"
		>
			{badge({})}
			<span className="text-xs truncate">{label.slice(0, 20)}</span>
		</a>
	);
}

export default UserDisplay;
