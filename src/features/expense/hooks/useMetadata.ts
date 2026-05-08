import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export const useMetadata = () => {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get("/expenses/categories");
      return response?.data?.data ?? [];
    },
    retry: 1,
    staleTime: 1000 * 60 * 10,
  });

  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await apiClient.get("/expenses/groups"); // Need to implement this in backend if missing or use mock
      return response.data.data || [];
    },
  });

  return {
    categories: categoriesQuery.data || [],
    groups: groupsQuery.data || [],
    isCategoriesLoading: categoriesQuery.isLoading,
    isCategoriesFetching: categoriesQuery.isFetching,
    categoriesError: categoriesQuery.error,
    refetchCategories: categoriesQuery.refetch,
    isLoading: categoriesQuery.isLoading || groupsQuery.isLoading,
  };
};
