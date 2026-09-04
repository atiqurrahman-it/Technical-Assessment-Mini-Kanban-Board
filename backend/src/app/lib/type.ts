import type { BoardRole } from '@prisma/client';

/** Payload encoded into every access token. */
export interface IJwtPayload {
  id: string;
  email: string;
}

/** A user's effective permission level on one board — null means no access. */
export type BoardAccessRole = BoardRole | null;
