import { SideMenu } from "@/components/SideMenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <SideMenu />
      <main className="flex-1 overflow-y-auto p-4 mt-9 md:p-8 md:mt-5">
        {children}
      </main>
    </div>
  );
}
