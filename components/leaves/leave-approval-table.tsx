"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { formatDateRange, titleCase } from "@/lib/format";

type LeaveRow = {
  id: string;
  type: string;
  startDate: Date | string;
  endDate: Date | string;
  days: number;
  reason: string;
  status: string;
  user: { id: string; name: string; department: string; jobTitle: string };
};

export function LeaveApprovalTable({ leaves }: { leaves: LeaveRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function decide(id: string, status: "APPROVED" | "REJECTED") {
    setPendingId(id);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/leaves/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error ?? "Unable to update leave request.");
          return;
        }

        toast.success(status === "APPROVED" ? "Leave request approved." : "Leave request rejected.");
        router.refresh();
      } catch {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setPendingId(null);
      }
    });
  }

  if (leaves.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
        No leave requests from the team yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.map((leave) => (
            <TableRow key={leave.id}>
              <TableCell>
                <div className="font-medium">{leave.user.name}</div>
                <div className="text-xs text-muted-foreground">{leave.user.department}</div>
              </TableCell>
              <TableCell className="font-medium">{titleCase(leave.type)}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateRange(leave.startDate, leave.endDate)}
              </TableCell>
              <TableCell>{leave.days}</TableCell>
              <TableCell className="max-w-[220px] truncate text-muted-foreground">{leave.reason}</TableCell>
              <TableCell>
                <StatusBadge status={leave.status} />
              </TableCell>
              <TableCell className="text-right">
                {leave.status === "PENDING" ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                      disabled={isPending && pendingId === leave.id}
                      onClick={() => decide(leave.id, "APPROVED")}
                    >
                      {isPending && pendingId === leave.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      disabled={isPending && pendingId === leave.id}
                      onClick={() => decide(leave.id, "REJECTED")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Decided</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
