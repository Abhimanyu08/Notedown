import { RxHamburgerMenu } from "react-icons/rx";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

function SideSheet({ children }: { children: React.ReactNode }) {
	return (
		<Sheet>
			<SheetTrigger className="absolute top-6 right-8">
				<button>
					<RxHamburgerMenu size={26} />
				</button>
			</SheetTrigger>
			<SheetContent side={"right"} className="">
				{children}
			</SheetContent>
		</Sheet>
	);
}

export default SideSheet;
