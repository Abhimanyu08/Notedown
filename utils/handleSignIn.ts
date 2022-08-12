import { supabase } from "./supabaseClient";

const handleSignIn = async (redirectTo: string) => {
    console.log(redirectTo)
    const { error } = await supabase.auth.signIn(
        {
            provider: "github",
        },
        { redirectTo: `http://localhost:3000${redirectTo}` }
    );
    if (error) {
        alert(error.message);
        return;
    }

    // router.replace("/");
}


export default handleSignIn