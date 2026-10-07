import Link from "next/link";
import "./test-drive.css";

export const metadata = {
  title: "Team notices - HR Pilot",
};

export default function TestDrivePage() {
  return (
    <main className="td-page">
      {/* Intentional, for Impeccable's test drive: gradient text on the heading. */}
      <h1 className="td-heading">Team notices for this quarter</h1>

      {/* Intentional, for Impeccable's test drive: body text flush with the viewport edges, no background or padding. */}
      <p className="td-edge">
        Annual leave requests for the year-end break should be submitted by the first of December so
        that approvals can be completed before payroll closes for the month.
      </p>

      {/* Intentional, for Impeccable's test drive: light grey text well under 4.5:1 contrast. */}
      <p className="td-faint">Payslips for last month are now available in the payroll section.</p>

      <div className="td-actions">
        {/* Intentional, for Impeccable's test drive: link text under the 11px floor. */}
        <Link href="/login" className="td-small-link">
          Log in to see your notices
        </Link>
        {/* Intentional, for Impeccable's test drive: transition on a layout property (width). */}
        <div className="td-bar" aria-hidden />
      </div>

      {/* Intentional, for Impeccable's test drive: a hard-coded colour outside the DESIGN.md palette. */}
      <p className="td-offpalette">Questions? Ask the HR team any weekday morning.</p>
    </main>
  );
}
