import React from "react";

export default function BlogPreviewLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div
			className={`lg:basis-3/5 relative 
			hidden lg:block
overflow-y-hidden
				`}
		>
			{children}
		</div>
	);
}
