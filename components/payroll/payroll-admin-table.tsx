import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatMonth } from "@/lib/format";

type PayslipRow = {
  id: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  user: { id: string; name: string; department: string; jobTitle: string };
};

export function PayrollAdminTable({ payslips }: { payslips: PayslipRow[] }) {
  if (payslips.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
        No payslips have been generated yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Month</TableHead>
            <TableHead className="text-right">Basic salary</TableHead>
            <TableHead className="text-right">Allowances</TableHead>
            <TableHead className="text-right">Deductions</TableHead>
            <TableHead className="text-right">Net pay</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payslips.map((payslip) => (
            <TableRow key={payslip.id}>
              <TableCell>
                <div className="font-medium">{payslip.user.name}</div>
                <div className="text-xs text-muted-foreground">{payslip.user.jobTitle}</div>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatMonth(payslip.month)}</TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatCurrency(payslip.basicSalary)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatCurrency(payslip.allowances)}
              </TableCell>
              <TableCell className="text-right text-rose-600">
                -{formatCurrency(payslip.deductions)}
              </TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(payslip.netPay)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
