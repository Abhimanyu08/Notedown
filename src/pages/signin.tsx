import { MouseEventHandler } from "react";
import { AiFillGithub } from "react-icons/ai";
import { supabase } from "../../utils/supabaseClient";

function signin() {
	const handleSignIn: MouseEventHandler<HTMLDivElement> = async (e) => {
		e.preventDefault();

		const { user, session, error } = await supabase.auth.signIn({
			provider: "github",
		});
		if (error) {
			alert(error.message);
			return;
		}

		// router.replace("/");
	};
	return (
		<div className="flex w-screen h-screen items-center justify-center bg-slate-200">
			<div
				className="flex gap-2 items-center bg-slate-100 p-1 rounded-lg"
				onClick={handleSignIn}
			>
				<span>Login with</span>
				<AiFillGithub />
			</div>
		</div>
	);
}

export default signin;
