import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="p-4 md:p-8 pt-16 md:pt-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
