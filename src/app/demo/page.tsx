import Hero from "@/components/sections/Hero";
import Story from "@/components/sections/Story";
import Services from "@/components/sections/Services";
import RoomShowcase from "@/components/sections/RoomShowcase";
import Gallery from "@/components/sections/Gallery";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-black theme-transition">
      <Hero />
      <div className="flex flex-col gap-0">
        <Story />
        <Services />
        <RoomShowcase />
        <Gallery />
      </div>
      <Footer />
    </div>
  );
}