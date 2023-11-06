import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { useToast } from "@components/ui/use-toast";
import prepareContainer from "@utils/prepareContainer";
import { useCallback, useContext, useState } from "react";

export default function useSetContainer() {
	const { blogState, dispatch } = useContext(BlogContext);
	const [preparingContainer, setPreparingContainer] = useState(false);

	const { toast } = useToast()
	const startPreparingContainer = useCallback(() => {
		setPreparingContainer(true);
		prepareContainer(
			blogState.blogMeta.language,
			blogState.containerId
		).then((containerId) => {
			if (!containerId) {
				setPreparingContainer(false);
				return;
			}
			if (containerId instanceof Error) {
				toast({
					title: containerId.message,
					variant: "destructive"
				})
				setPreparingContainer(false)
				return
			}
			dispatch({
				type: "set containerId",
				payload: containerId,
			});
			setPreparingContainer(false);
		});
	}, [blogState.blogMeta.language, blogState.containerId]);

	return {
		preparingContainer,
		startPreparingContainer,
	};
}
