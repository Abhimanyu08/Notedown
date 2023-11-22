"use client";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { BiCheck, BiLink } from "react-icons/bi";

function MinimalHeadingCopyButton({ headingId }: { headingId: string }) {
	const [copied, setCopied] = useState(false);
	const pathname = usePathname();
	return (
		<ToolTipComponent
			tip="Copy heading id"
			side="bottom"
			className="group-hover:visible invisible active:scale-90 ml-2 mt-1 "
			onClick={() => {
				setCopied(true);
				let p: Promise<any>;
				if (pathname?.startsWith("/write")) {
					p = navigator.clipboard.writeText(`#${headingId}`);
				} else {
					p = navigator.clipboard.writeText(
						`${window.location.href}#${headingId}`
					);
				}
				p.then(() => {
					setTimeout(() => setCopied(false), 2000);
				});
			}}
		>
			{copied ? <BiCheck size={18} /> : <BiLink size={18} />}
		</ToolTipComponent>
	);
}

export default MinimalHeadingCopyButton;
