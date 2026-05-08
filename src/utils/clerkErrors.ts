/**
 * Extracts a human-readable error message from a Clerk or Axios error.
 * Clerk errors have an `errors` array with `longMessage` / `message` fields.
 */
export const extractClerkError = (err: unknown): string => {
  if (!err || typeof err !== "object") return "Something went wrong";

  const e = err as Record<string, unknown>;

  // Clerk SDK error shape: { errors: [{ message, longMessage, code }] }
  const clerkErrors = e.errors as
    | Array<{ message?: string; longMessage?: string }>
    | undefined;
  if (Array.isArray(clerkErrors) && clerkErrors.length > 0) {
    return (
      clerkErrors[0].longMessage ||
      clerkErrors[0].message ||
      "Something went wrong"
    );
  }

  // Axios error shape: { response: { data: { message } } }
  const response = e.response as
    | { data?: { message?: string } }
    | undefined;
  if (response?.data?.message) return response.data.message;

  // Generic JS error
  if (typeof e.message === "string" && e.message.length > 0) return e.message;

  return "Something went wrong";
};
