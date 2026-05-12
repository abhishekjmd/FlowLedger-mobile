import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { apiClient } from "@/api/client";
import { normalizeInsights } from "@/utils/insights";

export const useAnalytics = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const enabled = isLoaded && !!isSignedIn;

  const summaryQuery = useQuery({
    queryKey: ["analytics", "monthly"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/monthly");
      return response.data.data;
    },
    enabled,
    retry: 1,
  });

  const breakdownQuery = useQuery({
    queryKey: ["analytics", "categories"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/categories");
      return response.data.data;
    },
    enabled,
    retry: 1,
  });

  const trendsQuery = useQuery({
    queryKey: ["analytics", "trends"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/trends");
      return response.data.data;
    },
    enabled,
    retry: 1,
  });

  const insightsQuery = useQuery({
    queryKey: ["analytics", "insights"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/insights");
      return response.data.data;
    },
    enabled,
    retry: 1,
  });

  return {
    summary: summaryQuery.data ?? { currentMonth: 0, lastMonth: 0, difference: 0 },
    breakdown: breakdownQuery.data || [],
    trends: trendsQuery.data || [],
    insights: normalizeInsights(insightsQuery.data || []),
    isLoading: 
      enabled && (
        (summaryQuery.isLoading && !summaryQuery.data) || 
        (breakdownQuery.isLoading && !breakdownQuery.data) || 
        (trendsQuery.isLoading && !trendsQuery.data) || 
        (insightsQuery.isLoading && !insightsQuery.data)
      ),
    isError:
      summaryQuery.isError ||
      breakdownQuery.isError ||
      trendsQuery.isError ||
      insightsQuery.isError,
    error:
      summaryQuery.error ||
      breakdownQuery.error ||
      trendsQuery.error ||
      insightsQuery.error,
    isRefetching:
      summaryQuery.isRefetching ||
      breakdownQuery.isRefetching ||
      trendsQuery.isRefetching ||
      insightsQuery.isRefetching,
    refetch: () => {
      summaryQuery.refetch();
      breakdownQuery.refetch();
      trendsQuery.refetch();
      insightsQuery.refetch();
    }
  };
};
