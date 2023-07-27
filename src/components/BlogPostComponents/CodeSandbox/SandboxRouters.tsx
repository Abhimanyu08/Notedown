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
	initialConfig,
}: ComponentProps<typeof CodesandboxWithEditor>) {
	const pathname = usePathname();
	if (pathname?.startsWith("/write")) {
		return (
			<CodesandboxWithEditor
				{...{ SANDBOX_NUMBER, start, end, initialConfig }}
			/>
		);
	}

	const config: SandpackConfigType = JSON.parse(initialConfig);

	return <CustomSandpack {...config} />;
}

export default SandboxRouter;
