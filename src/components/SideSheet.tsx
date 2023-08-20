import { RxHamburgerMenu } from "react-icons/rx";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

function SideSheet({ children }: { children: React.ReactNode }) {
	return (
		<Sheet>
			<SheetTrigger className="absolute top-6 right-8 z-50">
				<button>
					<RxHamburgerMenu size={20} />
				</button>
			</SheetTrigger>
			<SheetContent side={"right"} className="border-border">
				{children}
			</SheetContent>
		</Sheet>
	);
}

export default SideSheet;
