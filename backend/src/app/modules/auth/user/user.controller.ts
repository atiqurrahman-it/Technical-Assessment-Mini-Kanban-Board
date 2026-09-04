import httpStatus from 'http-status';
import catchAsync from '../../../../share/catchAsync';
import sendResponse from '../../../../share/sendResponse';
import { UserService } from './user.services';

const register = catchAsync(async (req, res) => {
  const data = await UserService.register(req.body);
  sendResponse(res, {
    statuscode: httpStatus.CREATED,
    success: true,
    message: 'Account created successfully',
    data,
  });
});

const login = catchAsync(async (req, res) => {
  const data = await UserService.login(req.body);
  sendResponse(res, {
    statuscode: httpStatus.OK,
    success: true,
    message: 'Logged in successfully',
    data,
  });
});

const getMe = catchAsync(async (req, res) => {
  const data = await UserService.getMe(req.user!.id);
  sendResponse(res, {
    statuscode: httpStatus.OK,
    success: true,
    message: 'Current user fetched successfully',
    data,
  });
});

export const UserController = { register, login, getMe };
