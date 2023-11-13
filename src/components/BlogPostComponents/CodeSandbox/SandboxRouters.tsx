"use client";
import useRecoverSandpack from "@/hooks/useRecoverSandpackConfig";
import { usePathname } from "next/navigation";
import { lazy, useEffect, useState } from "react";
import { VscLoading } from "react-icons/vsc";

const CustomSandpack = lazy(() => import("./CustomSandpack"));
//  Todo
function SandboxRouter({ persistanceKey }: { persistanceKey: string }) {
	const [downloading, setDownloading] = useState(false);
	const jsonConfigString = useRecoverSandpack({ persistanceKey });

	useEffect(() => {
		if (jsonConfigString) {
			setDownloading(false);
		}
	}, [jsonConfigString]);

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
