import { asyncHandler } from "#utils/asyncHandler.js";
import { dashboardService } from "#modules/dashboard/dashboard.service.js";

export const getDashboard = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getDashboard(req.user));
});
