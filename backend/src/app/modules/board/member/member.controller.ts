import httpStatus from 'http-status';
import catchAsync from '../../../../share/catchAsync';
import sendResponse from '../../../../share/sendResponse';
import { MemberService } from './member.services';

const addMember = catchAsync(async (req, res) => {
  const data = await MemberService.addMember(req.params.boardId, req.body);
  sendResponse(res, {
    statuscode: httpStatus.CREATED,
    success: true,
    message: 'Board shared successfully',
    data,
  });
});

const listMembers = catchAsync(async (req, res) => {
  const data = await MemberService.listMembers(req.params.boardId);
  sendResponse(res, {
    statuscode: httpStatus.OK,
    success: true,
    message: 'Members fetched successfully',
    data,
  });
});

const updateMemberRole = catchAsync(async (req, res) => {
  const data = await MemberService.updateMemberRole(
    req.params.boardId,
    req.params.userId,
    req.body.role,
  );
  sendResponse(res, {
    statuscode: httpStatus.OK,
    success: true,
    message: 'Member role updated successfully',
    data,
  });
});

const removeMember = catchAsync(async (req, res) => {
  await MemberService.removeMember(req.params.boardId, req.params.userId);
  sendResponse(res, {
    statuscode: httpStatus.OK,
    success: true,
    message: 'Member removed successfully',
  });
});

export const MemberController = { addMember, listMembers, updateMemberRole, removeMember };
