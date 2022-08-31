import matter from "gray-matter";
import {
	ChangeEventHandler,
	Dispatch,
	SetStateAction,
	useRef,
	useState,
} from "react";
import {
	SUPABASE_FILES_BUCKET,
	SUPABASE_IMAGE_BUCKET,
	SUPABASE_POST_TABLE,
} from "../../utils/constants";
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
	const [numImageTags, setNumImageTags] = useState(0);
	const [images, setImages] = useState<File[] | null>();
	const [uploading, setUploading] = useState(false);
	const [alertText, setAlert] = useState("");
	const [postDets, setPostDets] = useState<FileMetadata>();

	const cancelButton = useRef<HTMLLabelElement>(null);

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
		const { data } = matter(contents);
		if (!data.title) {
			setAlertTimer(
				`Please structure your markdown file correctly, title is missing`
			);
			return;
		}
		setPostDets({ ...(data as FileMetadata) });

		const numImageTags = Array.from(
			contents.matchAll(/!\[.*\]\(.*\)/g)
		).length;
		setMdFile(file);
		setNumImageTags(numImageTags);
	};

	const cleanUp = () => {
		setUploading(false);
		setImages(null);
		setNumImageTags(0);
		setMdFile(null);
		cancelButton.current?.dispatchEvent(new Event("click"));
	};
	const onFinalUpload = async () => {
		if (!mdfile) {
			setAlertTimer("Please select a markdown file");
			return;
		}
		if (numImageTags > 0 && (!images || images.length === 0)) {
			setAlertTimer(`Please select ${numImageTags} images`);
			return;
		}
		if ((images?.length || 0) < numImageTags) {
			setAlertTimer(`Please select ${numImageTags} images`);
			return;
		}
		setUploading(true);

		const blogFolder = `${userId}/${postDets?.title}`;
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

		if (numImageTags === 0) {
			cleanUp();
			return;
		}

		const imageResults = await Promise.all(
			images!.map(async (image) => {
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

		const filename = data.Key.match(
			new RegExp(`${SUPABASE_FILES_BUCKET}/(.*)`)
		)?.at(1);
		const { data: postTableData, error: postTableError } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.insert({
				created_by: userId,
				title: postDets?.title,
				language: postDets?.language,
				description: postDets?.description,
				filename,
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

		setAlertTimer("");
		cleanUp();
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
					{numImageTags > 0 && (
						<div className="mt-4">
							<label
								htmlFor="blogImages"
								className="text-white font-semibold mr-2"
							>
								Please upload {numImageTags}
								{numImageTags > 1 ? " images" : " image"}:
							</label>
							<input
								type="file"
								id="blogImages"
								max={numImageTags}
								multiple
								accept="image/*"
								className="file:rounded-xl file:text-sm"
								onChange={(e) =>
									setImages(Array.from(e.target.files || []))
								}
							/>
						</div>
					)}
					{alertText && <p className="text-red-400">{alertText}</p>}
					<div className="modal-action">
						<div
							className="btn btn-sm normal-case text-white "
							onClick={onFinalUpload}
						>
							Upload
						</div>
						<label
							htmlFor="upload"
							className="btn btn-sm normal-case text-white"
							ref={cancelButton}
						>
							Cancel
						</label>
					</div>
				</div>
			</div>
		</>
	);
}
