import React from "react";

export default function ToolbarLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="hidden lg:flex lg:flex-col basis-1/5 mt-44 pl-10 gap-6 text-black dark:text-white">
			{children}
		</div>
	);
}
