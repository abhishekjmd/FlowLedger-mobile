import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export const useDashboard = () => {
  const summaryQuery = useQuery({
    queryKey: ["analytics", "monthly"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/monthly");
      return response.data.data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["analytics", "categories"],
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

  const expensesQuery = useQuery({
    queryKey: ["expenses", "recent"],
    queryFn: async () => {
      const response = await apiClient.get("/expenses");
      return response.data.data.expenses.slice(0, 5); // Just recent 5
    },
  });

  return {
    summary: summaryQuery.data,
    categories: categoriesQuery.data,
    trends: trendsQuery.data,
    insights: insightsQuery.data,
    recentExpenses: expensesQuery.data,
    isLoading: 
      summaryQuery.isLoading || 
      categoriesQuery.isLoading || 
      trendsQuery.isLoading || 
      insightsQuery.isLoading || 
      expensesQuery.isLoading,
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
