import { BoardRole } from '@prisma/client';

/** Higher number = more permissions. VIEWER can read; EDITOR can also write; OWNER can also manage sharing/delete. */
export const ROLE_RANK: Record<BoardRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  OWNER: 2,
};

export const hasSufficientRole = (role: BoardRole, minRole: BoardRole): boolean =>
  ROLE_RANK[role] >= ROLE_RANK[minRole];
