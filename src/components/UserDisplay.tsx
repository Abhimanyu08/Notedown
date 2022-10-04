import { User } from "@supabase/supabase-js";
import Image from "next/image";
import { useState } from "react";
import {
	AiOutlineGithub,
	AiOutlineLink,
	AiOutlineTwitter,
} from "react-icons/ai";
import { IconType } from "react-icons/lib";
import {
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_IMAGE_BUCKET,
} from "../../utils/constants";
import makeFolderName from "../../utils/makeFolderName";
import { sendRevalidationRequest } from "../../utils/sendRequest";
import { supabase } from "../../utils/supabaseClient";
import Blogger from "../interfaces/Blogger";
interface UserDisplayProps {
	profile: Partial<Blogger>;
	user: User | null;
}

function UserDisplay({ profile, user }: UserDisplayProps) {
	const [editing, setEditing] = useState(false);
	const [newPic, setNewPic] = useState<File | null>(null);
	const [currProfile, setCurrProfile] = useState(profile);
	const [uploadingChanges, setUploadingChanges] = useState(false);

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

		if (currProfile.name && currProfile.name !== profile?.name) {
			changes["name"] = currProfile.name;
		}
		if (newPic) {
			const { data, error } = await supabase.storage
				.from(SUPABASE_IMAGE_BUCKET)
				.list(makeFolderName(profile.id!, "AVATAR"));
			console.log(data);
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
					currProfile["avatar_url"] = publicURL;
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
					currProfile["avatar_url"] = publicURL;
				}
			}
		}

		await supabase
			.from<Blogger>(SUPABASE_BLOGGER_TABLE)
			.update(changes)
			.eq("id", profile.id!);
		setUploadingChanges(false);
		sendRevalidationRequest(`profile/${profile.id}`);
		setEditing(false);
	};

	return (
		<div className="flex flex-col items-center md:items-start gap-2 w-full md:w-40 h-3/4 ">
			<div className="avatar ">
				<div
					className={`rounded-xl ${
						editing ? "border-2 border-base-200" : ""
					}`}
				>
					{editing ? (
						<div className="w-32 h-32 flex items-center justify-center">
							<label
								htmlFor="dp"
								className="btn btn-xs capitalize bg-base-200 w-fit
                                truncate text-white"
							>
								{newPic ? newPic.name : "Upload"}
							</label>
							<input
								type="file"
								name=""
								id="dp"
								max={1}
								accept="image/*"
								className="hidden"
								onChange={(e) =>
									setNewPic(e.target?.files?.item(0) || null)
								}
							/>
						</div>
					) : (
						currProfile?.avatar_url && (
							<Image
								src={currProfile.avatar_url}
								width={160}
								height={160}
								layout="intrinsic"
								objectFit="contain"
							/>
						)
					)}
				</div>
			</div>
			{editing ? (
				<div className="flex flex-col gap-2 items-start">
					<input
						type="text"
						name=""
						id="name"
						className="input input-xs bg-white text-black"
						value={currProfile.name}
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
						value={currProfile.twitter}
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
						value={currProfile.github}
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
				<div className="flex flex-col gap-4 items-center w-full">
					<h1 className={` text-xs font-bold md:text-lg`}>
						{currProfile.name}
					</h1>
					<div className="flex md:flex-col w-full mx-2 items-center justify-center gap-4">
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
					<div className="flex gap-1 justify-center w-full ">
						<div
							className={` btn btn-xs  bg-base-200 normal-case md:mt-10 text-white ${
								uploadingChanges ? "loading" : ""
							}`}
							onClick={onSave}
						>
							Save
						</div>
						<div
							className="btn btn-xs bg-base-200 normal-case md:mt-10 text-white"
							onClick={() => {
								setEditing(false);
								setCurrProfile(profile);
							}}
						>
							Cancel
						</div>
					</div>
				) : (
					<div className="flex w-full justify-center">
						<div
							className="btn btn-xs bg-base-200 normal-case w-fit md:mt-10 text-white"
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
			className="flex gap-1 w-1/3 md:w-full self-center"
			href={link}
			target="_blank"
		>
			{badge({})}
			<span className="text-xs truncate">{label.slice(0, 20)}</span>
		</a>
	);
}

export default UserDisplay;
