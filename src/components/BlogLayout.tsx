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
				className={`lg:basis-1/5  md:flex-col justify-center lg:flex ${
					showContent
						? "absolute z-50 top-0 left-0 opacity-100 w-screen"
						: "hidden"
				}`}
			>
				{children[0]}
			</div>
			<div
				className={`lg:basis-3/5 relative ${
					showContent ? "opacity-0 w-screen" : "w-screen"
				}`}
			>
				{children[1]}
			</div>

			<div className="hidden lg:flex lg:flex-col basis-1/5 w-fit mt-44 pl-5 gap-6">
				{children[2]}
			</div>
		</div>
	);
}

export default BlogLayout;
