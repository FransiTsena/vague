import TrainingHero from "@/components/sections/TrainingHero";
import TrainingAbout from "@/components/sections/TrainingAbout";
import TrainingCourses from "@/components/sections/TrainingCourses";
import TrainingEnroll from "@/components/sections/TrainingEnroll";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";

export default function Training() {
    return (
        <div className="min-h-screen bg-black theme-transition">
            <TrainingHero />
            <TrainingAbout />
            <TrainingCourses />
            <TrainingEnroll />
            <Contact mode="training" />
            <Footer />
        </div>
    );
}
