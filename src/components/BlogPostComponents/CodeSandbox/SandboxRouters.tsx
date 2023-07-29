"use client";
import { usePathname } from "next/navigation";
import React, {
	ComponentProps,
	useContext,
	useEffect,
	useLayoutEffect,
	useState,
} from "react";
import CodesandboxWithEditor from "./CodesandboxWithEditor";
import CustomSandpack from "./CustomSandpack";
import { SandpackConfigType } from "./types";
import { useSupabase } from "@/app/appContext";
import { SUPABASE_FILES_BUCKET } from "@utils/constants";
import { BlogContext } from "../BlogState";
import { EditorContext } from "@/app/write/components/EditorContext";
import { VscLoading } from "react-icons/vsc";

//  Todo
function SandboxRouter({
	persistanceKey,
}: ComponentProps<typeof CodesandboxWithEditor>) {
	const pathname = usePathname();
	const { supabase } = useSupabase();
	const { blogState } = useContext(BlogContext);
	const [downloadedJsonString, setDownloadedJsonString] = useState("");
	const [downloading, setDownloading] = useState(false);

	const downloadFileAndReturnJson = async (fileName: string) => {
		const { data, error } = await supabase.storage
			.from(SUPABASE_FILES_BUCKET)
			.download(fileName);
		if (!data || error) return "";

		const jsonString = await data.text();
		return jsonString;
	};

	useEffect(() => {
		if (!blogState.uploadedFileNames || pathname?.startsWith("/write"))
			return;
		if (blogState.uploadedFileNames.includes(`${persistanceKey}.json`)) {
			setDownloading(true);
			const { blogger, id } = blogState.blogMeta;
			const fileName = `${blogger?.id}/${id}/${persistanceKey}.json`;
			downloadFileAndReturnJson(fileName).then((jsonString) => {
				setDownloadedJsonString(jsonString);
				setDownloading(false);
			});
		}
	}, []);

	if (pathname?.startsWith("/write")) {
		return (
			<CodesandboxWithEditor
				persistanceKey={persistanceKey}
				key={persistanceKey}
			/>
		);
	}

	if (downloading || !downloadedJsonString) {
		return (
			<div className="w-full border-y-[1px] border-border py-10 flex flex-col gap-4 items-center justify-center">
				<VscLoading size={30} className="animate-spin" />
				<span>Downloading Sandbox config</span>
			</div>
		);
	}
	try {
		const config = JSON.parse(downloadedJsonString);
		return <CustomSandpack {...config} persistanceKey={persistanceKey} />;
	} catch (e) {
		return <p>{(e as Error).message}</p>;
	}
}

export default SandboxRouter;

//if the path is not /write, simply download all files called persistanceKey.json and return customSandpack
// if persistanceKey.json is in blogState.uploadedFilenames but persistanceKey is not in editorstate.jsonEditors then download the file.
// in every other case simply return codesandbox with editor
