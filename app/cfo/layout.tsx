import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BRHT CFO | Strategic CFO Advisory",
  description:
    "Outsourced CFO advisory for growing companies that need clearer financial insights, stronger forecasting, better reporting, and strategic financial guidance.",
};

export default function CfoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function () {
              const version = '20260926-final';
              const targets = [
                ['img[alt="Brennan Roney"]', '/images/team/brennan-roney.jpg'],
                ['img[alt="AI-generated placeholder portrait for Steve Johnson"]', '/images/team/steve-johnson.jpg']
              ];
              targets.forEach(([selector, path]) => {
                const img = document.querySelector(selector);
                if (img) img.src = path + '?v=' + version;
              });
            });
          `,
        }}
      />
    </>
  );
}
