import { asyncHandler } from "#utils/asyncHandler.js";
import { authService } from "#modules/auth/auth.service.js";

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json(user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateMe(req.user.id, req.body);
  res.json(user);
});
