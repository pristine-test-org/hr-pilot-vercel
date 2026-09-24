import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubmitClaimDialog } from "@/components/claims/submit-claim-dialog";
import { ClaimHistoryTable } from "@/components/claims/claim-history-table";
import { ClaimApprovalTable } from "@/components/claims/claim-approval-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default async function ClaimsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isAdmin = user.role === "ADMIN";

  const [myClaims, allClaims, pendingCount] = await Promise.all([
    prisma.claim.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    isAdmin
      ? prisma.claim.findMany({
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true, department: true, jobTitle: true } } },
        })
      : Promise.resolve([]),
    isAdmin ? prisma.claim.count({ where: { status: "PENDING" } }) : Promise.resolve(0),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Claims</h1>
          <p className="mt-1 text-muted-foreground">
            Submit expense claims for food, travel, medical and more.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Claims over RM 500 need a receipt.</p>
          <span className="mt-2 inline-block max-w-[7rem] truncate rounded-md border px-2 py-0.5 text-xs">
            Reimbursed within 5 working days
          </span>
        </div>
        <SubmitClaimDialog />
      </div>

      {isAdmin ? (
        <Tabs defaultValue="mine">
          <TabsList>
            <TabsTrigger value="mine">My Claims</TabsTrigger>
            <TabsTrigger value="team">
              Team Claims
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-1.5">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="mine" className="mt-4">
            <ClaimHistoryTable claims={myClaims} />
          </TabsContent>
          <TabsContent value="team" className="mt-4">
            <ClaimApprovalTable claims={allClaims} />
          </TabsContent>
        </Tabs>
      ) : (
        <ClaimHistoryTable claims={myClaims} />
      )}
    </div>
  );
}
