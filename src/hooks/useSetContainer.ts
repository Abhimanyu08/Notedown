import prepareContainer from "@/app/utils/prepareContainer";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { useCallback, useContext, useState } from "react";

export default function useSetContainer() {
    const { blogState, dispatch } = useContext(BlogContext)
    const [preparingContainer, setPreparingContainer] = useState(false)

    const startPreparingContainer = useCallback(() => {

        setPreparingContainer(true)
        prepareContainer(
            blogState.blogMeta.language,
            blogState.containerId
        ).then((containerId) => {
            if (!containerId) return;
            dispatch({
                type: "set containerId",
                payload: containerId,
            });
            setPreparingContainer(false)
        })

    }, [blogState.blogMeta.language, blogState.containerId])

    return {
        preparingContainer,
        startPreparingContainer
    }

}