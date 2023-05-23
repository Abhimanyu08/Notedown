import { BlogProps } from "@/interfaces/BlogProps";
import { SUPABASE_FILES_BUCKET, SUPABASE_POST_TABLE } from "@utils/constants";
import { makeFolderName } from "@utils/makeFolderName";
import { supabase } from "@utils/supabaseClient";
import React from "react";
import { VscLoading } from "react-icons/vsc";

function UploadModal() {
	return (
		<>
			<input
				type="checkbox"
				name=""
				id="upload"
				className="modal-input"
			/>
			<label htmlFor="upload" className="modal-box">
				<div className="flex flex-col bg-black p-10 gap-4">
					<StageUpdates status="Uploading post file" />
					<StageUpdates status="Uploading photos" />
					<StageUpdates status="Uploading canvas images" />
				</div>
			</label>
		</>
	);
}

const StageUpdates = ({ status }: { status: string }) => {
	return (
		<div className="flex items-center w-52">
			<span className="basis-10/12">{status}</span>
			<VscLoading className="animate-spin" />
		</div>
	);
};

type UploadPostProps = {
	userId: string;
	title: string;
	description: string;
	language: BlogProps["language"];
	markdownFile: File;
};

async function uploadPost({
	userId,
	title,
	description,
	language,
	markdownFile,
}: UploadPostProps) {
	try {
		// create a new post entry in posts table
		const { data, error } = await supabase
			.from(SUPABASE_POST_TABLE)
			.insert({
				title,
				description,
				language,
				created_by: userId,
			})
			.select("*")
			.single();
		if (error) throw error;
		if (!data) throw new Error("Couldn't create new post row in database");

		//using the id of the created post, upload post's markdown file

		const folderName = userId + "/" + data.id + "/" + markdownFile.name;

		const { data: fileUploadData, error: fileUploadError } =
			await supabase.storage
				.from(SUPABASE_FILES_BUCKET)
				.upload(folderName, markdownFile);

		if (fileUploadError) throw fileUploadError;
		if (!fileUploadData) throw new Error("Couldn't upload markdown file");
	} catch (e) {
		alert((e as Error).message);
	}
}

export default UploadModal;
