import { asyncHandler } from "#utils/asyncHandler.js";
import { productosService } from "#modules/productos/productos.service.js";

export const list = asyncHandler(async (req, res) => {
  res.json(await productosService.list(req.query));
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await productosService.create(req.body));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await productosService.update(req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  await productosService.remove(req.params.id);
  res.status(204).send();
});
