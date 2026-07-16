import { asyncHandler } from "#utils/asyncHandler.js";
import { clientesService } from "#modules/clientes/clientes.service.js";

export const list = asyncHandler(async (req, res) => {
  res.json(await clientesService.list(req.query));
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await clientesService.create(req.body));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await clientesService.update(req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  await clientesService.remove(req.params.id);
  res.status(204).send();
});
