function BlogLayout({ children }: { children: JSX.Element[] | JSX.Element }) {
	return (
		<div className="grow flex flex-row min-h-0 relative mb-16 md:mb-0">
			{children}
		</div>
	);
}

export default BlogLayout;
