import { SetStateAction } from "react";
import Post from "./Post";

export default interface ModalProps {

    post: Partial<Post>
    modifyPosts: (
        type: "published" | "unpublished",
        newPosts: SetStateAction<Partial<Post>[] | null | undefined>
    ) => void
}