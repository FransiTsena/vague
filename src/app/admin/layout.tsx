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
      <div className="flex flex-1 pt-24 md:pt-32">
        <div className="hidden md:block w-64 flex-shrink-0">
          <AdminSidebar />
        </div>
        <div className="flex-1 md:ml-0">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
