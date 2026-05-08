import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { toast } from "@/lib/toast";

export const useExpenses = (filters: any = {}) => {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["expenses", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get("/expenses", {
        params: { ...filters, page: pageParam, limit: 10 },
      });
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post("/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create expense");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.patch(`/expenses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update expense");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete expense");
    },
  });

  return {
    expenses: query.data?.pages.flatMap((page) => page.expenses) || [],
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
