import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { LogIn, Menu } from "lucide-react";

function SideSheet({
	loggedIn,
	children,
}: {
	loggedIn: boolean;
	children: React.ReactNode;
}) {
	return (
		<Sheet>
			<SheetTrigger className="absolute top-6 right-8 z-50">
				<button>
					{loggedIn ? (
						<Menu />
					) : (
						<div className="flex gap-1 text-gray-400">
							<LogIn />
							<span>Login</span>
						</div>
					)}
				</button>
			</SheetTrigger>
			<SheetContent side={"right"} className="border-border">
				{children}
			</SheetContent>
		</Sheet>
	);
}

export default SideSheet;
