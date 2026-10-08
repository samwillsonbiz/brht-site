import Link from "next/link";

export default function SamSuccessPage() {
  return (
    <main className="min-h-screen bg-[#07142c] px-5 text-white">
      <div className="mx-auto flex min-h-screen max-w-[760px] flex-col items-center justify-center text-center">
        <div className="text-[10px] font-black tracking-[0.24em] text-[#a9c5ff]">
          SAM 2028
        </div>
        <h1 className="mt-5 text-[clamp(3.5rem,9vw,6.5rem)] font-black leading-[0.9] tracking-[-0.07em]">
          Thank you.
        </h1>
        <p className="mt-6 max-w-[580px] text-[17px] leading-8 text-[#c4cede]">
          Your support went through Stripe Checkout. Funding never changes your vote
          or buys additional influence.
        </p>
        <Link
          href="/sam"
          className="mt-9 bg-[#d82335] px-6 py-4 text-[11px] font-black uppercase tracking-[0.1em]"
        >
          Return to SAM
        </Link>
      </div>
    </main>
  );
}
