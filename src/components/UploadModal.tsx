import matter from "gray-matter";
import { useRouter } from "next/router";
import { ChangeEventHandler, Dispatch, SetStateAction, useState } from "react";
import {
	DESCRIPTION_LENGTH,
	PHOTO_LIMIT,
	SUPABASE_FILES_BUCKET,
	SUPABASE_IMAGE_BUCKET,
	SUPABASE_POST_TABLE,
	TITLE_LENGTH,
} from "../../utils/constants";
import makeFolderName from "../../utils/makeFolderName";
import { supabase } from "../../utils/supabaseClient";
import FileMetadata from "../interfaces/FileMetdata";
import Post from "../interfaces/Post";

export function UploadModal({
	userId,
	setClientPosts,
}: {
	userId: string;
	setClientPosts: Dispatch<
		SetStateAction<Partial<Post>[] | null | undefined>
	>;
}) {
	const [mdfile, setMdFile] = useState<File | null>();
	const [images, setImages] = useState<File[] | null>();
	const [uploading, setUploading] = useState(false);
	const [alertText, setAlert] = useState("");
	const [postDets, setPostDets] = useState<FileMetadata>();
	const [uploaded, setUploaded] = useState(false);
	const [uploadedPostId, setUploadedPostId] = useState<number | null>(null);
	const router = useRouter();

	const cleanUp = () => {
		setUploading(false);
		setImages(null);
		setMdFile(null);
		setUploaded(true);
	};

	const setAlertTimer = (text: string) => {
		setAlert(text);
		setTimeout(() => setAlert(""), 3 * 1000);
	};

	const onFileSelect: ChangeEventHandler<HTMLInputElement> = async (e) => {
		e.preventDefault();
		const file = e.target.files?.item(0);
		if (!file || file.name.split(".").at(1) !== "md") {
			setAlertTimer("Please select a markdown file");
			return;
		}

		const contents = await file.text();
		const { data } = matter(contents) as {
			data: { title?: string; language?: string; description?: string };
		};
		if (!data.title) {
			setAlertTimer(
				`Please structure your markdown file correctly, title is missing`
			);
			return;
		}

		if (data.title.length > TITLE_LENGTH) {
			setAlertTimer(
				`Your title is ${data.title.length} characters long. Max ${TITLE_LENGTH} characters allowed`
			);
			return;
		}
		if ((data.description?.length || 0) > DESCRIPTION_LENGTH) {
			setAlertTimer(
				`Your description is ${data.description?.length} characters long. Max ${DESCRIPTION_LENGTH} characters allowed`
			);
			return;
		}

		setPostDets({ ...(data as FileMetadata) });

		setMdFile(file);
	};

	const onFinalUpload = async () => {
		if (!mdfile) {
			setAlertTimer("Please select a markdown file");
			return;
		}

		if (!postDets) {
			setAlertTimer(`Not able to read title from your post file`);
			return;
		}
		setUploading(true);

		//insert row in table
		const { data: postTableData, error: postTableError } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.insert({
				created_by: userId,
				title: postDets?.title,
				language: postDets?.language,
				description: postDets?.description,
			});

		if (postTableError || !postTableData || postTableData.length === 0) {
			setAlertTimer(
				postTableError?.message ||
					"null data returned by supabase" + " Please retry"
			);
			setUploading(false);
			return;
		}

		setClientPosts((prev) => [
			postTableData.at(0) as Post,
			...(prev || []),
		]);
		setUploadedPostId(postTableData.at(0)?.id || null);

		//upload markdown file
		const postId = postTableData.at(0)?.id;
		if (!postId) return;
		const blogFolder = makeFolderName(userId, postId);
		const blogFilePath = blogFolder + `/${mdfile.name}`;

		const { data, error } = await supabase.storage
			.from(SUPABASE_FILES_BUCKET)
			.upload(blogFilePath, mdfile);

		if (error || !data) {
			console.log(error || "Supabase didn't return any data");
			setAlertTimer(error?.message || "" + " Please retry");
			setUploading(false);
			return;
		}
		//upload images
		if (images) {
			const imageResults = await Promise.all(
				images.map(async (image) => {
					console.log(image.type);
					const imagePath = blogFolder + `/${image.name}`;
					const result = await supabase.storage
						.from(SUPABASE_IMAGE_BUCKET)
						.upload(imagePath, image);
					return result;
				})
			);
			if (imageResults.some((res) => res.error !== null)) {
				setAlertTimer("Error in uploading images, please retry");
				setUploading(false);
				return;
			}
		}

		const { error: updateTableError } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.update({ filename: blogFilePath, image_folder: blogFolder })
			.eq("id", postId);
		if (updateTableError) {
			setAlertTimer(`${updateTableError.message}`);
			return;
		}
		setAlertTimer("");
		cleanUp();
	};

	const onPreview = () => {
		if (uploadedPostId) router.push(`/posts/preview/${uploadedPostId}`);
	};

	return (
		<>
			<input type="checkbox" id="upload" className="modal-toggle" />
			<div className="modal">
				<div className="modal-box shadow-md shadow-slate-600 bg-slate-800">
					<label
						htmlFor="file"
						className="text-white font-semibold mr-2"
					>
						Select markdown file:
					</label>
					<input
						type="file"
						name=""
						id="file"
						onChange={onFileSelect}
						accept=".md"
						className="file:rounded-xl file:text-sm"
					/>
					<div className="mt-4">
						<label
							htmlFor="blogImages"
							className="text-white font-semibold mr-2"
						>
							Please upload images used in your blog (if any, max{" "}
							{PHOTO_LIMIT})
						</label>
						<input
							type="file"
							id="blogImages"
							multiple
							accept="image/*"
							className="file:rounded-xl file:text-sm"
							max={PHOTO_LIMIT}
							onChange={(e) =>
								setImages(Array.from(e.target.files || []))
							}
						/>
					</div>
					{alertText && <p className="text-red-400">{alertText}</p>}
					<div className="modal-action">
						<div
							className={`btn btn-sm normal-case text-white ${
								uploading ? "loading" : ""
							}`}
							onClick={uploaded ? onPreview : onFinalUpload}
						>
							{uploaded ? "Preview" : "Upload"}
						</div>
						<label
							htmlFor="upload"
							className="btn btn-sm normal-case text-white"
							onClick={() => {
								setMdFile(null);
								setImages(null);
								setUploaded(false);
							}}
						>
							{uploaded ? "Done" : "Cancel"}
						</label>
					</div>
				</div>
			</div>
		</>
	);
}
