import { asyncHandler } from "#utils/asyncHandler.js";
import { reportesService } from "#modules/reportes/reportes.service.js";

export const getReportes = asyncHandler(async (req, res) => {
  res.json(await reportesService.getReports());
});
