import Link from "next/link";
import "./test-drive.css";

export const metadata = { title: "Leave policy highlights - HR Pilot" };

export default function TestDrivePage() {
  return (
    <div className="td-page">
      <main className="td-main">
        {/* Intentional, for Impeccable's test drive: gradient text on the heading. */}
        <h1 className="td-heading">Leave policy highlights</h1>

        {/* Intentional, for Impeccable's test drive: body text flush with the viewport edges, no background. */}
        <p className="td-edge-text">
          Every employee receives annual, sick and unpaid leave entitlements, and HR Pilot keeps the balances
          and approvals for your whole team in one place.
        </p>

        {/* Intentional, for Impeccable's test drive: solid light grey text, well under 4.5:1 on white. */}
        <p className="td-faint">Balances refresh each morning before the working day starts.</p>

        {/* Intentional, for Impeccable's test drive: a colour outside the DESIGN.md palette. */}
        <div className="td-card">
          <h2>Next step</h2>
          <p>Apply for leave from your dashboard.</p>
        </div>

        {/* Intentional, for Impeccable's test drive: layout property transition (width). */}
        <div className="td-bar" aria-hidden />

        <div className="td-links">
          {/* Intentional, for Impeccable's test drive: link text under the 11px floor. */}
          <Link href="/login" className="td-tiny-link">
            Log in to apply
          </Link>
          <Link href="/">Back to home</Link>
        </div>
      </main>
    </div>
  );
}
