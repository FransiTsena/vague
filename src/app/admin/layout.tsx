import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-black transition-colors duration-700">
      <div className="flex-1 pt-24 md:pt-32">
          {children}
      </div>
      <Footer />
    </div>
  );
}
