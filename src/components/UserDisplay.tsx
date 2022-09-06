import React, { useState } from "react";
import Blogger from "../interfaces/Blogger";
import Image from "next/image";
import { supabase } from "../../utils/supabaseClient";
import {
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_IMAGE_BUCKET,
} from "../../utils/constants";
import makeFolderName from "../../utils/makeFolderName";
import { sendRevalidationRequest } from "../../utils/sendRequest";
interface UserDisplayProps {
	profile?: Blogger;
}

function UserDisplay({ profile }: UserDisplayProps) {
	const [editing, setEditing] = useState(false);
	const [newName, setNewName] = useState("");
	const [newPic, setNewPic] = useState<File | null>(null);

	const onSave = async () => {
		if (!profile) return;

		let changes: Partial<Blogger> = {};
		if (newName && newName !== profile?.name) {
			changes["name"] = newName;
		}
		if (newPic) {
			const imagePath =
				makeFolderName(profile?.id, "avatar") + `/${newPic.name}`;
			await supabase.storage
				.from(SUPABASE_IMAGE_BUCKET)
				.upload(imagePath, newPic);
			const { publicURL } = await supabase.storage
				.from(SUPABASE_IMAGE_BUCKET)
				.getPublicUrl(imagePath);
			if (publicURL) {
				changes["avatar_url"] = publicURL;
			}
		}

		await supabase
			.from<Blogger>(SUPABASE_BLOGGER_TABLE)
			.update(changes)
			.eq("id", profile.id);
		sendRevalidationRequest(`profile/${profile.id}`);
		setEditing(false);
	};

	return (
		<div className="flex flex-col items-center gap-2 w-fit">
			<div className="avatar w-36 h-36 ">
				<div
					className={`rounded-3xl ${
						editing ? "border-2 border-base-200" : ""
					}`}
				>
					{editing ? (
						<div className="w-full h-full flex items-center justify-center">
							<label
								htmlFor="dp"
								className="btn btn-sm capitalize bg-base-200 w-28
                                truncate"
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
						profile?.avatar_url && (
							<Image
								src={profile.avatar_url}
								width={128}
								height={128}
								layout="responsive"
								objectFit="contain"
							/>
						)
					)}
				</div>
			</div>
			{editing ? (
				<input
					type="text"
					name=""
					id=""
					className="input input-sm bg-white text-black w-fit "
					placeholder={profile?.name || ""}
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
				/>
			) : (
				<h1 className={`text-lg font-normal w-fit `}>
					{profile?.name}
				</h1>
			)}
			{editing ? (
				<div
					className="btn btn-sm bg-base-200 normal-case mt-10"
					onClick={onSave}
				>
					Save
				</div>
			) : (
				<div
					className="btn btn-sm bg-base-200 normal-case w-fit mt-10"
					onClick={() => setEditing((prev) => !prev)}
				>
					Edit
				</div>
			)}
		</div>
	);
}

export default UserDisplay;
