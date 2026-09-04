import { Board, BoardRole } from '@prisma/client';
import { IJwtPayload } from '../app/lib/type';

declare global {
  namespace Express {
    interface Request {
      /** Attached by the `authenticate` middleware once the JWT is verified. */
      user?: IJwtPayload;
      /** Attached by `requireBoardAccess` — the board the current route operates on. */
      board?: Board;
      /** Attached by `requireBoardAccess` — the caller's effective role on `board`. */
      boardRole?: BoardRole;
    }
  }
}
