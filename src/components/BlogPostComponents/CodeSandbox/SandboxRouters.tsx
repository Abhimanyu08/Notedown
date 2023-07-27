"use client";
import { usePathname } from "next/navigation";
import React, { ComponentProps } from "react";
import CodesandboxWithEditor from "./CodesandboxWithEditor";
import CustomSandpack from "./CustomSandpack";
import { SandpackConfigType } from "./types";

function SandboxRouter({
	SANDBOX_NUMBER,
	start,
	end,
	configString,
}: ComponentProps<typeof CodesandboxWithEditor> & { configString: string }) {
	const pathname = usePathname();
	if (pathname?.startsWith("/write")) {
		return (
			<CodesandboxWithEditor
				{...{ SANDBOX_NUMBER, start, end, initialConfig: configString }}
			/>
		);
	}

	const config: SandpackConfigType = JSON.parse(configString);
	console.log(config);

	return <CustomSandpack {...config} />;
}

export default SandboxRouter;
