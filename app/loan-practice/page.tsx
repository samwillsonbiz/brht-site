import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Amortisation Practice | BRHT",
  description: "Interactive online loan amortisation practice worksheet for students.",
};

export default function LoanPracticePage() {
  return (
    <main style={{ width: "100%", minHeight: "100dvh", height: "100dvh", overflow: "hidden" }}>
      <iframe
        title="Loan amortisation interactive student worksheet"
        src="/loan-practice.html"
        style={{ width: "100%", height: "100%", display: "block", border: 0 }}
        referrerPolicy="same-origin"
      />
    </main>
  );
}
