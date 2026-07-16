import { asyncHandler } from "#utils/asyncHandler.js";
import { ventasService } from "#modules/ventas/ventas.service.js";

export const list = asyncHandler(async (req, res) => {
  res.json(await ventasService.list(req.query));
});

export const getById = asyncHandler(async (req, res) => {
  res.json(await ventasService.getById(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await ventasService.create(req.body, req.user.id));
});

export const remove = asyncHandler(async (req, res) => {
  await ventasService.remove(req.params.id);
  res.status(204).send();
});
