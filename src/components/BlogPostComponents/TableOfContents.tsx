import { cn } from "@/lib/utils";
import {
	HeadingType,
	createHeadingIdFromHeadingText,
	mdToHast,
} from "@utils/html2Jsx/transformer";

const Toc = ({ markdown }: { markdown: string }) => {
	const { headingAST } = mdToHast(markdown);

	return <HeadingNodeToDetailsTag headingNode={headingAST} />;
};

const HeadingNodeToDetailsTag = ({
	headingNode,
}: {
	headingNode: HeadingType;
}) => {
	return (
		<details
			className={cn(
				"flex flex-col my-1 text-gray-400",
				headingNode.depth !== 0 && "ml-6"
			)}
			open={headingNode.depth === 0}
		>
			<summary
				className={cn(
					"hover:underline hover:text-gray-100",
					headingNode.children.length === 0 && "list-none "
				)}
			>
				<a
					href={
						headingNode.depth !== 0
							? "#" +
							  createHeadingIdFromHeadingText(headingNode.text)
							: "#title"
					}
				>
					{headingNode.text}
				</a>
			</summary>
			{headingNode.children.map((c) => (
				<HeadingNodeToDetailsTag headingNode={c} key={c.text} />
			))}
		</details>
	);
};

export default Toc;
