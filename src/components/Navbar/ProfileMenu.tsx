import { Database } from "@/interfaces/supabase";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import { HiMenu } from "react-icons/hi";
import { LoggedInOptions, NotLoggedInOptions } from "./Options";

async function ProfileMenu() {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

	const { data } = await supabase.auth.getSession();
	const session = data.session;

	return (
		<>
			<div className="relative group">
				{session?.user ? (
					<>
						<div className="cursor-pointer ">
							<HiMenu className={`lg:text-xl`} />
						</div>

						<LoggedInOptions userId={session.user.id} />
					</>
				) : (
					<>
						<div className="cursor-pointer select-none ">Login</div>
						<NotLoggedInOptions />
					</>
				)}
			</div>
		</>
	);
}

export default ProfileMenu;
