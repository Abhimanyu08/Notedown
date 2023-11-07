import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { LogIn, Menu } from "lucide-react";
import { cookies, headers } from "next/headers";

async function SideSheet({
	loggedIn,
	loggedInChildren,
	notLoggedInChildren,
}: {
	loggedIn?: boolean;
	loggedInChildren: React.ReactNode;
	notLoggedInChildren: React.ReactNode;
}) {
	let userPresent = loggedIn;
	if (typeof userPresent !== "boolean") {
		const supabase = createServerComponentSupabaseClient({
			headers,
			cookies,
		});
		const {
			data: { session },
		} = await supabase.auth.getSession();

		userPresent = !!session;
	}

	return (
		<Sheet>
			<SheetTrigger className="absolute top-6 right-8 z-50">
				{userPresent ? (
					<Menu />
				) : (
					<div className="flex gap-1 text-gray-400">
						<LogIn />
						<span>Login</span>
					</div>
				)}
			</SheetTrigger>
			<SheetContent side={"right"} className="border-border">
				{userPresent ? loggedInChildren : notLoggedInChildren}
			</SheetContent>
		</Sheet>
	);
}

export default SideSheet;
