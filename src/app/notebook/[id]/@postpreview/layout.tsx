import React from "react";

function PostPreviewLayout({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="col-span-7 h-full row-span-1 pt-10 relative  
				overflow-y-auto
		lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
				scroll-smooth
	
				"
		>
			{children}
		</div>
	);
}

export default PostPreviewLayout;
