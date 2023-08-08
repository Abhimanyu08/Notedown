"use client";
import useShortCut from "@/hooks/useShortcut";
import { cn } from "@/lib/utils";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { ToolTipComponent } from "../ToolTipComponent";
import { usePathname } from "next/navigation";

export function ExpandButton({ className }: { className?: string }) {
	const pathname = usePathname();
	useShortCut({
		keys: ["e"],
		callback: () => {
			window.location.href = pathname || "";
		},
	});

	return (
		<ToolTipComponent
			tip="Expand (E)"
			className={cn("text-gray-400", className)}
		>
			<a href={pathname || ""}>
				<BsArrowsAngleExpand size={20} />
			</a>
		</ToolTipComponent>
	);
}
