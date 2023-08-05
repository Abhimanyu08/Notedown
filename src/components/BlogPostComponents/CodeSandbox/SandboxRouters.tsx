"use client";
import { useSupabase } from "@/app/appContext";
import { SUPABASE_FILES_BUCKET } from "@utils/constants";
import { usePathname } from "next/navigation";
import { lazy, useContext, useEffect, useState } from "react";
import { VscLoading } from "react-icons/vsc";
import { BlogContext } from "../BlogState";
import useRecoverSandpack from "@/hooks/useRecoverSandpackConfig";

const CodesandboxWithEditor = lazy(() => import("./CodesandboxWithEditor"));
const CustomSandpack = lazy(() => import("./CustomSandpack"));
//  Todo
function SandboxRouter({ persistanceKey }: { persistanceKey: string }) {
	const pathname = usePathname();
	const [downloading, setDownloading] = useState(false);
	const jsonConfigString = useRecoverSandpack({ persistanceKey });

	useEffect(() => {
		if (jsonConfigString) {
			setDownloading(false);
		}
	}, [jsonConfigString]);

	if (pathname?.startsWith("/write")) {
		return (
			<CodesandboxWithEditor
				persistanceKey={persistanceKey}
				key={persistanceKey}
			/>
		);
	}

	if (downloading || !jsonConfigString) {
		return (
			<div className="w-full border-y-[1px] border-border py-10 flex flex-col gap-4 items-center justify-center">
				<VscLoading size={30} className="animate-spin" />
				<span>Downloading Sandbox config</span>
			</div>
		);
	}
	try {
		const config = JSON.parse(jsonConfigString);
		return <CustomSandpack {...config} persistanceKey={persistanceKey} />;
	} catch (e) {
		return <p>{(e as Error).message}</p>;
	}
}

export default SandboxRouter;

//if the path is not /write, simply download all files called persistanceKey.json and return customSandpack
// if persistanceKey.json is in blogState.uploadedFilenames but persistanceKey is not in editorstate.jsonEditors then download the file.
// in every other case simply return codesandbox with editor
