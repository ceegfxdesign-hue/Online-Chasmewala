/**
 * Auth HTTP controllers — thin adapters over authService. Refresh tokens are set
 * as httpOnly cookies; access tokens are returned in the JSON body.
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/ApiResponse.js';
import { authService } from '../services/auth.service.js';
import { REFRESH_COOKIE, refreshCookieOptions } from '../utils/token.js';

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions());
}

export const authController = {
  register: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    setRefreshCookie(res, refreshToken);
    return sendCreated(res, { message: 'Account created', data: { user, accessToken } });
  }),

  login: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    setRefreshCookie(res, refreshToken);
    return sendSuccess(res, { message: 'Signed in', data: { user, accessToken } });
  }),

  refresh: asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    const { user, accessToken, refreshToken } = await authService.refresh(token);
    setRefreshCookie(res, refreshToken);
    return sendSuccess(res, { message: 'Session refreshed', data: { user, accessToken } });
  }),

  logout: asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    await authService.logout(req.user?._id, token);
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    return sendSuccess(res, { message: 'Signed out' });
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user._id);
    return sendSuccess(res, { data: { user } });
  }),

  requestOtp: asyncHandler(async (req, res) => {
    const { email, purpose } = req.body;
    const result = await authService.requestOtp(email, purpose);
    return sendSuccess(res, { message: 'OTP sent', data: result });
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const result = await authService.verifyOtp(req.body);
    return sendSuccess(res, { message: 'OTP verified', data: result });
  }),
};

export default authController;
