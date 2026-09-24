import { redirect } from "next/navigation";
import { CalendarDays, HeartPulse } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLeaveBalance } from "@/lib/leave-balance";
import { StatCard } from "@/components/stat-card";
import { ApplyLeaveDialog } from "@/components/leaves/apply-leave-dialog";
import { LeaveHistoryTable } from "@/components/leaves/leave-history-table";
import { LeaveApprovalTable } from "@/components/leaves/leave-approval-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default async function LeavesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isAdmin = user.role === "ADMIN";

  const [balance, myLeaves, allLeaves, pendingCount] = await Promise.all([
    getLeaveBalance(user.id, user.annualLeaveDays, user.sickLeaveDays),
    prisma.leaveRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    isAdmin
      ? prisma.leaveRequest.findMany({
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true, department: true, jobTitle: true } } },
        })
      : Promise.resolve([]),
    isAdmin ? prisma.leaveRequest.count({ where: { status: "PENDING" } }) : Promise.resolve(0),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leaves</h1>
          <p className="mt-1 text-[#d4d4d8]">
            Apply for leave and keep track of your balance and requests.
          </p>
        </div>
        <ApplyLeaveDialog />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={CalendarDays}
          label="Annual leave balance"
          value={`${balance.annual.remaining} / ${balance.annual.total} days`}
          hint={`${balance.annual.used} days taken this year`}
        />
        <StatCard
          icon={HeartPulse}
          label="Sick leave balance"
          value={`${balance.sick.remaining} / ${balance.sick.total} days`}
          hint={`${balance.sick.used} days taken this year`}
        />
      </div>

      {isAdmin ? (
        <Tabs defaultValue="mine">
          <TabsList>
            <TabsTrigger value="mine">My Leaves</TabsTrigger>
            <TabsTrigger value="team">
              Team Requests
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-1.5">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="mine" className="mt-4">
            <LeaveHistoryTable leaves={myLeaves} />
          </TabsContent>
          <TabsContent value="team" className="mt-4">
            <LeaveApprovalTable leaves={allLeaves} />
          </TabsContent>
        </Tabs>
      ) : (
        <LeaveHistoryTable leaves={myLeaves} />
      )}
    </div>
  );
}
