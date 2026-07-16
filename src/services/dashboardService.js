import { apiClient } from "@/services/apiClient";

function getDashboard() {
  return apiClient.get("/dashboard");
}

export const dashboardService = { getDashboard };
