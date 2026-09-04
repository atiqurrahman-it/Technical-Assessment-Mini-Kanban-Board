import httpStatus from 'http-status';
import catchAsync from '../../../../share/catchAsync';
import sendResponse from '../../../../share/sendResponse';
import { ColumnService } from './column.services';

const createColumn = catchAsync(async (req, res) => {
  const data = await ColumnService.createColumn(req.params.boardId, req.body.name);
  sendResponse(res, {
    statuscode: httpStatus.CREATED,
    success: true,
    message: 'Column created successfully',
    data,
  });
});

const updateColumn = catchAsync(async (req, res) => {
  const data = await ColumnService.updateColumn(
    req.params.boardId,
    req.params.columnId,
    req.body.name,
  );
  sendResponse(res, {
    statuscode: httpStatus.OK,
    success: true,
    message: 'Column updated successfully',
    data,
  });
});

const deleteColumn = catchAsync(async (req, res) => {
  await ColumnService.deleteColumn(req.params.boardId, req.params.columnId);
  sendResponse(res, {
    statuscode: httpStatus.OK,
    success: true,
    message: 'Column deleted successfully',
  });
});

export const ColumnController = { createColumn, updateColumn, deleteColumn };
