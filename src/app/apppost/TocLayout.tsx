import React from "react";

export default function TocLayout({ children }: { children: React.ReactNode }) {
	return (
		<div
			className={`lg:basis-1/5 w-full flex-col max-w-full overflow-y-auto justify-start ${
				true ? "flex" : "hidden lg:flex"
			}

	lg:scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-700
					`}
		>
			{children}
		</div>
	);
}
