import React from "react";

export default function BlogPreviewLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div
			className={`lg:basis-3/5 relative ${
				true ? "hidden lg:block" : "w-screen"
			} 
overflow-y-hidden
				`}
		>
			{children}
		</div>
	);
}
