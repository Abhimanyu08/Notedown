import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEventHandler, Dispatch, SetStateAction, useState } from "react";
import FileMetadata from "../../interfaces/FileMetdata";
import Post from "../../interfaces/Post";
import { PHOTO_LIMIT } from "@utils/constants";
import { getHtmlFromMarkdown } from "@utils/getResources";
import { handlePostUpload } from "@utils/handleUploadsAndUpdates";

export function UploadModal({
	userId,
	afterUploadCallback,
}: {
	userId: string;
	afterUploadCallback: (newPost: Post) => void;
}) {
	const [mdfile, setMdFile] = useState<File | null>();
	const [images, setImages] = useState<File[]>([]);
	const [uploading, setUploading] = useState(false);
	const [alertText, setAlert] = useState("");
	const [postDets, setPostDets] = useState<FileMetadata>();
	const [uploaded, setUploaded] = useState(false);
	const [uploadedPostId, setUploadedPostId] = useState<number | null>(null);
	const router = useRouter();

	const cleanUp = () => {
		setUploading(false);
		setImages([]);
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

		getHtmlFromMarkdown(file)
			.then(({ data }) => {
				setPostDets({ ...(data as FileMetadata) });
				setMdFile(file);
			})
			.catch((err: Error) => {
				setAlertTimer(err.message);
			});
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

		handlePostUpload({
			userId,
			postMetadata: postDets,
			imagesToUpload: images,
			markdownFile: mdfile,
		})
			.then((val) => {
				if (!val)
					throw Error(
						"post uploaded but supabase didn't return any data"
					);
				cleanUp();
				afterUploadCallback(val);
				setUploadedPostId(val.id);
			})
			.catch((e) => setAlertTimer(e.message));
	};

	const onPreview = () => {
		if (uploadedPostId)
			router.push(`/posts/preview?postId=${uploadedPostId}`);
	};

	return (
		<>
			<input type="checkbox" id="upload" className="modal-toggle" />
			<div className="modal">
				<div className="modal-box shadow-md shadow-slate-600 bg-slate-800">
					<div className="flex flex-col">
						<Link href={`/edit`}>
							<label
								htmlFor="upload"
								className="btn btn-sm normal-case text-white"
							>
								Write a file in markdown
							</label>
						</Link>
						<div className="divider text-white">Or</div>
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
								Please upload images used in your blog (if any,
								max {PHOTO_LIMIT})
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
						{alertText && (
							<p className="text-red-400">{alertText}</p>
						)}
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
									setImages([]);
									setUploaded(false);
								}}
							>
								{uploaded ? "Done" : "Cancel"}
							</label>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
