import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { apiClient } from "@/api/client";

const EMPTY_LIST: any[] = [];

export const useMetadata = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const enabled = isLoaded && !!isSignedIn;

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get("/expenses/categories");
      return response?.data?.data ?? [];
    },
    enabled,
    retry: 1,
    staleTime: 1000 * 60 * 10,
  });

  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await apiClient.get("/expenses/groups"); // Need to implement this in backend if missing or use mock
      return response.data.data || [];
    },
    enabled,
    retry: 1,
  });

  return {
    categories: categoriesQuery.data || EMPTY_LIST,
    groups: groupsQuery.data || EMPTY_LIST,
    isCategoriesLoading: categoriesQuery.isLoading,
    isCategoriesFetching: categoriesQuery.isFetching,
    categoriesError: categoriesQuery.error,
    refetchCategories: categoriesQuery.refetch,
    isLoading: !isLoaded || categoriesQuery.isLoading || groupsQuery.isLoading,
  };
};
