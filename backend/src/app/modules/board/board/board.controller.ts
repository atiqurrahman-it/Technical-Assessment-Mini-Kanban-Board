import httpStatus from 'http-status';
import catchAsync from '../../../../share/catchAsync';
import sendResponse from '../../../../share/sendResponse';
import { BoardService } from './board.services';

const createBoard = catchAsync(async (req, res) => {
  const data = await BoardService.createBoard(req.user!.id, req.body);
  sendResponse(res, {
    statuscode: httpStatus.CREATED,
    success: true,
    message: 'Board created successfully',
    data,
  });
});

const getBoards = catchAsync(async (req, res) => {
  const data = await BoardService.getBoardsForUser(req.user!.id);
  sendResponse(res, {
    statuscode: httpStatus.OK,
    success: true,
    message: 'Boards fetched successfully',
    data,
  });
});

// `requireBoardAccess` has already verified the caller can see this board.
const getBoard = catchAsync(async (req, res) => {
  const data = await BoardService.getBoardDetail(req.params.boardId);
  sendResponse(res, {
    statuscode: httpStatus.OK,
    success: true,
    message: 'Board fetched successfully',
    data: { ...data, myRole: req.boardRole },
  });
});

const updateBoard = catchAsync(async (req, res) => {
  const data = await BoardService.updateBoard(req.params.boardId, req.body);
  sendResponse(res, {
    statuscode: httpStatus.OK,
    success: true,
    message: 'Board updated successfully',
    data,
  });
});

const deleteBoard = catchAsync(async (req, res) => {
  await BoardService.deleteBoard(req.params.boardId);
  sendResponse(res, {
    statuscode: httpStatus.OK,
    success: true,
    message: 'Board deleted successfully',
  });
});

export const BoardController = { createBoard, getBoards, getBoard, updateBoard, deleteBoard };
