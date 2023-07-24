export function SinglePostLoading() {
	return (
		<div className="flex flex-col gap-3 [&>*]:animate-pulse">
			<div className="w-72 bg-gray-800 h-6 rounded-sm"></div>
			<div className="w-80 bg-gray-800 h-4 rounded-sm"></div>
		</div>
	);
}
