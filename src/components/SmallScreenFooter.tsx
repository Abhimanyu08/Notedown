import React from "react";

function SmallScreenFooter({ children }: { children: JSX.Element[] }) {
	return (
		<footer className="w-full z-50 text-xs md:text-sm flex items-end lg:hidden justify-between md:justify-evenly p-3 md:px-5 md:py-5 sticky bottom-0 left-0 bg-gray-400 dark:bg-stone-700 border-t-2 border-white/25">
			{children}
		</footer>
	);
}

export default SmallScreenFooter;
