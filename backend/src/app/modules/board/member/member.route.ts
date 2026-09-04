import express from 'express';
import { BoardRole } from '@prisma/client';
import { requireBoardAccess } from '../../../middlewares/boardAccess';
import { validateRequest } from '../../../middlewares/validationRequest';
import { MemberController } from './member.controller';
import { MemberValidation } from './member.validation';

// mergeParams so this router (mounted at /boards/:boardId/members) can read :boardId
const router = express.Router({ mergeParams: true });

// Share the board with a registered user — owner only
router.post(
  '/',
  requireBoardAccess(BoardRole.OWNER),
  validateRequest(MemberValidation.addMemberSchema),
  MemberController.addMember,
);

// List current members — any member can see who has access
router.get('/', requireBoardAccess(BoardRole.VIEWER), MemberController.listMembers);

// Change a member's role — owner only
router.patch(
  '/:userId',
  requireBoardAccess(BoardRole.OWNER),
  validateRequest(MemberValidation.updateMemberSchema),
  MemberController.updateMemberRole,
);

// Revoke access — owner only
router.delete('/:userId', requireBoardAccess(BoardRole.OWNER), MemberController.removeMember);

export const MemberRouter = router;
