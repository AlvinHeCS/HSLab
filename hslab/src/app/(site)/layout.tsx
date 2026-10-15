import { Sidebar, TabBar } from "~/app/_components/nav";
import { daysTogether, TOGETHER_SINCE, todayIn } from "~/lib/special-dates";

/** Everything behind the passphrase: sidebar on desktop, tab bar on phones. */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[260px_1fr]">
      <Sidebar day={daysTogether(todayIn())} since={TOGETHER_SINCE} />
      <div className="min-w-0">{children}</div>
      <TabBar />
    </div>
  );
}
