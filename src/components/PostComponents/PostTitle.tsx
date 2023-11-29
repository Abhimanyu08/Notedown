function PostTitle({ title }: { title: string }) {
	return (
		<h2 className="text-black font-sans underline  decoration-transparent group-hover:decoration-gray-300 transition-all duration-100 underline-offset-2 dark:text-gray-300 break-words max-w-3/4">
			{title}{" "}
		</h2>
	);
}

export default PostTitle;
