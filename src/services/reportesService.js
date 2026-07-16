import { apiClient } from "@/services/apiClient";

function getReports() {
  return apiClient.get("/reportes");
}

export const reportesService = { getReports };
