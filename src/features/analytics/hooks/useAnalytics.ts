import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export const useAnalytics = () => {
  const summaryQuery = useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/monthly");
      return response.data.data;
    },
  });

  const breakdownQuery = useQuery({
    queryKey: ["analytics", "breakdown"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/categories");
      return response.data.data;
    },
  });

  const trendsQuery = useQuery({
    queryKey: ["analytics", "trends"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/trends");
      return response.data.data;
    },
  });

  const insightsQuery = useQuery({
    queryKey: ["analytics", "insights"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/insights");
      return response.data.data;
    },
  });

  return {
    summary: summaryQuery.data,
    breakdown: breakdownQuery.data || [],
    trends: trendsQuery.data || [],
    insights: insightsQuery.data || [],
    isLoading: 
      summaryQuery.isLoading || 
      breakdownQuery.isLoading || 
      trendsQuery.isLoading || 
      insightsQuery.isLoading,
    refetch: () => {
      summaryQuery.refetch();
      breakdownQuery.refetch();
      trendsQuery.refetch();
      insightsQuery.refetch();
    }
  };
};
