import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { apiClient } from "@/api/client";
import { normalizeInsights } from "@/utils/insights";

export const useDashboard = () => {
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

  const categoriesQuery = useQuery({
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

  const expensesQuery = useQuery({
    queryKey: ["expenses", "recent"],
    queryFn: async () => {
      const response = await apiClient.get("/expenses");
      return (response.data.data?.expenses ?? []).slice(0, 5);
    },
    enabled,
    retry: 1,
  });

  return {
    summary: summaryQuery.data ?? { currentMonth: 0, lastMonth: 0, difference: 0 },
    categories: categoriesQuery.data ?? [],
    trends: trendsQuery.data ?? [],
    insights: normalizeInsights(insightsQuery.data ?? []),
    recentExpenses: expensesQuery.data ?? [],
    isLoading: 
      enabled && (
        (summaryQuery.isLoading && !summaryQuery.data) || 
        (categoriesQuery.isLoading && !categoriesQuery.data) || 
        (trendsQuery.isLoading && !trendsQuery.data) || 
        (insightsQuery.isLoading && !insightsQuery.data) || 
        (expensesQuery.isLoading && !expensesQuery.data)
      ),
    isError:
      summaryQuery.isError ||
      categoriesQuery.isError ||
      trendsQuery.isError ||
      insightsQuery.isError ||
      expensesQuery.isError,
    error:
      summaryQuery.error ||
      categoriesQuery.error ||
      trendsQuery.error ||
      insightsQuery.error ||
      expensesQuery.error,
    isRefetching: 
      summaryQuery.isRefetching || 
      categoriesQuery.isRefetching || 
      trendsQuery.isRefetching || 
      insightsQuery.isRefetching || 
      expensesQuery.isRefetching,
    refetch: async () => {
      await Promise.all([
        summaryQuery.refetch(),
        categoriesQuery.refetch(),
        trendsQuery.refetch(),
        insightsQuery.refetch(),
        expensesQuery.refetch(),
      ]);
    },
  };
};
