import Blogger from "@/interfaces/Blogger";
import PostWithBlogger from "@/interfaces/PostWithBlogger";
import React, { createContext } from "react";

type ProfileContextProps = {
	user: Blogger | null;
	posts: PostWithBlogger[] | null;
};

export const ProfileContext = createContext<ProfileContextProps>({
	user: null,
	posts: null,
});

function ProfileContextProvider(
	props: { children: React.ReactNode } & ProfileContextProps
) {
	return (
		<ProfileContext.Provider value={props}>
			{props.children}
		</ProfileContext.Provider>
	);
}

export default ProfileContextProvider;
