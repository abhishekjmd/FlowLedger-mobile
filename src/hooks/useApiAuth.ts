import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { setTokenGetter } from "@/api/client";

/**
 * Wires Clerk's getToken into the global API client.
 * By storing the *getter function* (not the token value), every API request
 * fetches a fresh JWT — avoiding the race condition seen in auth screens.
 */
export function useApiAuth() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      setTokenGetter(getToken);
    } else {
      setTokenGetter(null);
    }

    return () => {
      setTokenGetter(null);
    };
  }, [isSignedIn, getToken]);
}
