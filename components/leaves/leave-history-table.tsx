import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { formatDateRange } from "@/lib/format";
import { titleCase } from "@/lib/format";

type LeaveRow = {
  id: string;
  type: string;
  startDate: Date | string;
  endDate: Date | string;
  days: number;
  reason: string;
  status: string;
};

export function LeaveHistoryTable({ leaves }: { leaves: LeaveRow[] }) {
  if (leaves.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
        You haven&apos;t taken any leave yet. Use Apply for leave to request your first days off.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.map((leave) => (
            <TableRow key={leave.id}>
              <TableCell className="font-medium">{titleCase(leave.type)}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateRange(leave.startDate, leave.endDate)}
              </TableCell>
              <TableCell>{leave.days}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">{leave.reason}</TableCell>
              <TableCell className="text-right">
                <StatusBadge status={leave.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
