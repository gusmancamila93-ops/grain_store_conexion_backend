import { asyncHandler } from "#utils/asyncHandler.js";
import { configuracionService } from "#modules/configuracion/configuracion.service.js";

export const getTienda = asyncHandler(async (req, res) => {
  res.json(await configuracionService.getTienda());
});

export const updateTienda = asyncHandler(async (req, res) => {
  res.json(await configuracionService.updateTienda(req.body));
});

export const getSistema = asyncHandler(async (req, res) => {
  res.json(configuracionService.getSistema());
});
