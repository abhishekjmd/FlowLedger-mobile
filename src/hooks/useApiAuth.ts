import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { setAuthToken } from "@/api/client";

export function useApiAuth() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn) {
        const token = await getToken();
        setAuthToken(token);
      } else {
        setAuthToken(null);
      }
    };
    syncToken();
  }, [isSignedIn, getToken]);
}

