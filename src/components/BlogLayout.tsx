function BlogLayout({
	children,
	showContent,
}: {
	children: JSX.Element[];
	showContent: boolean;
}) {
	return (
		<div className="grow flex flex-row min-h-0 relative">
			<div
				className={`lg:basis-1/5 w-full flex-col lg:pt-44 max-w-full overflow-y-auto justify-start ${
					showContent ? "flex" : "hidden lg:flex"
				} 
				
lg:scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-700
				`}
			>
				{children[0]}
			</div>
			<div
				className={`lg:basis-3/5 relative ${
					showContent ? "hidden lg:block" : "w-screen"
				} 
overflow-y-hidden
				`}
			>
				{children[1]}
			</div>

			<div className="hidden lg:flex lg:flex-col basis-1/5 mt-44 pl-10 gap-6">
				{children[2]}
			</div>
		</div>
	);
}

export default BlogLayout;
