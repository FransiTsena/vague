"use client";

import PlatformLandingHero from "@/components/sections/PlatformLandingHero";
import PlatformFeatures from "@/components/sections/PlatformFeatures";
import AIVisualization from "@/components/sections/AIVisualization";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";

export default function PlatformLandingPage() {
  return (
    <AnimatePresence>
      <div className="min-h-screen bg-black theme-transition overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <PlatformLandingHero />
          
          <div className="flex flex-col gap-0 relative z-10">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <PlatformFeatures />
            </motion.div>

            <AIVisualization />

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
            >
              <Contact />
            </motion.div>
          </div>

          <Footer />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

