import { SetStateAction } from "react";
import Post from "./Post";

export default interface ModalProps {

    post: Partial<Post>
    afterActionCallback: (newPost: Partial<Post>) => void
}