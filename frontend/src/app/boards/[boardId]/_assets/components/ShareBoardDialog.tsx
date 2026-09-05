"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { CustomField } from "@/components/common/fields/cusInputField";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BoardDetail } from "@/types/kanban";
import { InviteMemberFormValues, inviteMemberSchema } from "../schema/share.schema";
import { useAddMember, useRemoveMember, useUpdateMemberRole } from "../services/member.service";

const ROLE_OPTIONS = [
  { label: "Editor", value: "EDITOR" },
  { label: "Viewer", value: "VIEWER" },
];

/** Invite-by-email + member list, with role management restricted to the board owner. */
export function ShareBoardDialog({ board }: { board: BoardDetail }) {
  const [open, setOpen] = useState(false);
  const [removingMember, setRemovingMember] = useState<{ id: string; name: string } | null>(null);
  const addMember = useAddMember(board.id);
  const updateRole = useUpdateMemberRole(board.id);
  const removeMember = useRemoveMember(board.id);
  const isOwner = board.myRole === "OWNER";

  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", role: "EDITOR" },
  });

  function onInvite(values: InviteMemberFormValues) {
    addMember.mutate(values, { onSuccess: () => form.reset({ email: "", role: "EDITOR" }) });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <UserPlus className="h-4 w-4" /> Share
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share &ldquo;{board.name}&rdquo;</DialogTitle>
          <DialogDescription>
            People with access can view — and, with editor access, change — this board.
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <form onSubmit={form.handleSubmit(onInvite)} className="flex items-start gap-2">
            <div className="flex-1">
              <CustomField.Text form={form} name="email" placeholder="Email address" />
            </div>
            <CustomField.SelectField form={form} name="role" options={ROLE_OPTIONS} />
            <Button type="submit" isLoading={addMember.isPending}>
              Invite
            </Button>
          </form>
        )}

        <Separator className="my-4" />

        <div className="max-h-72 space-y-3 overflow-y-auto">
          <MemberRow name={board.owner.name} email={board.owner.email} roleLabel="Owner" />

          {board.members.map((member) => (
            <MemberRow
              key={member.id}
              name={member.user.name}
              email={member.user.email}
              roleLabel={member.role === "EDITOR" ? "Editor" : "Viewer"}
              action={
                isOwner ? (
                  <>
                    <Select
                      value={member.role}
                      onValueChange={(role) =>
                        updateRole.mutate({
                          path: `boards/${board.id}/members/${member.user.id}`,
                          role,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EDITOR">Editor</SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => setRemovingMember({ id: member.user.id, name: member.user.name })}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${member.user.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : undefined
              }
            />
          ))}

          {board.members.length === 0 && (
            <p className="py-2 text-sm text-muted-foreground">Not shared with anyone yet.</p>
          )}
        </div>
      </DialogContent>

      <ConfirmDialog
        open={removingMember !== null}
        onOpenChange={(next) => !next && setRemovingMember(null)}
        title={`Remove ${removingMember?.name}?`}
        description="They'll lose access to this board until invited again."
        confirmLabel="Remove"
        isLoading={removeMember.isPending}
        onConfirm={() =>
          removingMember &&
          removeMember.mutate(
            { path: `boards/${board.id}/members/${removingMember.id}` },
            { onSuccess: () => setRemovingMember(null) }
          )
        }
      />
    </Dialog>
  );
}

function MemberRow({
  name,
  email,
  roleLabel,
  action,
}: {
  name: string;
  email: string;
  roleLabel: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <UserAvatar name={name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
      {action ?? <span className="shrink-0 text-xs font-medium text-muted-foreground">{roleLabel}</span>}
    </div>
  );
}
