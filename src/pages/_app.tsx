import type { AppProps } from "next/app";
import { useEffect } from "react";
import "../../styles/globals.css";
import { supabase } from "../../utils/supabaseClient";

function MyApp({ Component, pageProps }: AppProps) {
	useEffect(() => {
		const { data } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				await fetch("/api/auth", {
					method: "POST",
					headers: new Headers({
						"Content-Type": "application/json",
					}),
					credentials: "same-origin",
					body: JSON.stringify({ event, session }),
				});
			}
		);

		return () => data?.unsubscribe();
	}, []);

	return <Component {...pageProps} />;
}

export default MyApp;
