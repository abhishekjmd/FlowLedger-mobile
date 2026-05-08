import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { apiClient } from "@/api/client";
import { toast } from "@/lib/toast";

export const useGroups = () => {
  const queryClient = useQueryClient();
  const { isLoaded, isSignedIn } = useAuth();
  const enabled = isLoaded && !!isSignedIn;

  const listQuery = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await apiClient.get("/expenses/groups");
      return response.data.data;
    },
    enabled,
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
    // isLoading only true on very first load with no cache
    isLoading: enabled && listQuery.isLoading && !listQuery.data,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
    isRefetching: listQuery.isRefetching,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};

export const useGroupDetails = (id: string) => {
  const queryClient = useQueryClient();
  const { isLoaded, isSignedIn } = useAuth();
  const enabled = isLoaded && !!isSignedIn && !!id;

  const detailsQuery = useQuery({
    queryKey: ["groups", id],
    queryFn: async () => {
      const response = await apiClient.get(`/expenses/groups/${id}`);
      return response.data.data;
    },
    enabled,
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

  const inviteMutation = useMutation({
    mutationFn: (data: { email: string }) => apiClient.post(`/expenses/groups/${id}/invite`, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["groups", id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      return response;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Invite failed");
    },
  });

  return {
    group: detailsQuery.data,
    // Only true if no cache available
    isLoading: enabled && detailsQuery.isLoading && !detailsQuery.data,
    isError: detailsQuery.isError,
    error: detailsQuery.error,
    refetch: detailsQuery.refetch,
    settle: settleMutation.mutate,
    isSettling: settleMutation.isPending,
    invite: inviteMutation.mutate,
    isInviting: inviteMutation.isPending,
  };
};
