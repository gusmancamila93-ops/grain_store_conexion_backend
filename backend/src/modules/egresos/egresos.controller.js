import { asyncHandler } from "#utils/asyncHandler.js";
import { egresosService } from "#modules/egresos/egresos.service.js";

export const list = asyncHandler(async (req, res) => {
  res.json(await egresosService.list(req.query));
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await egresosService.create(req.body, req.user.id));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await egresosService.update(req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  await egresosService.remove(req.params.id);
  res.status(204).send();
});
