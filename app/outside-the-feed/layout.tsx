import LiveSourceLab from "./live-source-lab";

export default function OutsideTheFeedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <LiveSourceLab />
    </>
  );
}
