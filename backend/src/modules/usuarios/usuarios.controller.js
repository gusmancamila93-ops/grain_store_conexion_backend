import { asyncHandler } from "#utils/asyncHandler.js";
import { usuariosService } from "#modules/usuarios/usuarios.service.js";

export const list = asyncHandler(async (req, res) => {
  res.json(await usuariosService.list());
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await usuariosService.create(req.body));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await usuariosService.update(req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  await usuariosService.remove(req.params.id);
  res.status(204).send();
});
