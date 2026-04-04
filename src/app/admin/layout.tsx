import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen pt-24">
      <div className="flex-1">
          {children}
      </div>
      <Footer />
    </div>
  );
}
