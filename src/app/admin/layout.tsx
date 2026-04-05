import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white transition-colors duration-700 dark:bg-black">
      <Header />
      <div className="flex flex-1 pt-20 md:pt-24">
        <div className="hidden md:block w-56 flex-shrink-0 border-r border-neutral-100 dark:border-white/5">
          <AdminSidebar />
        </div>
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
