import httpStatus from 'http-status';
import catchAsync from '../../../../share/catchAsync';
import sendResponse from '../../../../share/sendResponse';
import { TaskService } from './task.services';

const createTask = catchAsync(async (req, res) => {
  const data = await TaskService.createTask(req.params.boardId, req.user!.id, req.body);
  sendResponse(res, {
    statuscode: httpStatus.CREATED,
    success: true,
    message: 'Task created successfully',
    data,
  });
});

const updateTask = catchAsync(async (req, res) => {
  const data = await TaskService.updateTask(req.params.boardId, req.params.taskId, req.body);
  sendResponse(res, {
    statuscode: httpStatus.OK,
    success: true,
    message: 'Task updated successfully',
    data,
  });
});

const deleteTask = catchAsync(async (req, res) => {
  await TaskService.deleteTask(req.params.boardId, req.params.taskId);
  sendResponse(res, {
    statuscode: httpStatus.OK,
    success: true,
    message: 'Task deleted successfully',
  });
});

// Reorders a task within its column, or moves it to a specific index in
// another column — see TaskService.moveTask for the ordering algorithm.
const moveTask = catchAsync(async (req, res) => {
  const data = await TaskService.moveTask(req.params.boardId, req.params.taskId, req.body);
  sendResponse(res, {
    statuscode: httpStatus.OK,
    success: true,
    message: 'Task moved successfully',
    data,
  });
});

export const TaskController = { createTask, updateTask, deleteTask, moveTask };
