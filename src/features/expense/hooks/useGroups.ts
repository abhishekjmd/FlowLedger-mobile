import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { toast } from "@/lib/toast";

export const useGroups = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await apiClient.get("/expenses/groups");
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post("/expenses/groups", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create group");
    },
  });

  return {
    groups: listQuery.data || [],
    isLoading: listQuery.isLoading,
    refetch: listQuery.refetch,
    isRefetching: listQuery.isRefetching,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};

export const useGroupDetails = (id: string) => {
  const queryClient = useQueryClient();

  const detailsQuery = useQuery({
    queryKey: ["groups", id],
    queryFn: async () => {
      const response = await apiClient.get(`/expenses/groups/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  const settleMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`/expenses/groups/${id}/settle`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", id] });
      toast.success("Settlement recorded!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Settlement failed");
    },
  });

  return {
    group: detailsQuery.data,
    isLoading: detailsQuery.isLoading,
    refetch: detailsQuery.refetch,
    settle: settleMutation.mutate,
    isSettling: settleMutation.isPending,
  };
};
