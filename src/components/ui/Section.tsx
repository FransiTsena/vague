"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface SectionProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
}

const Section = forwardRef<HTMLElement, SectionProps>(
    ({ children, className, id }, ref) => {
        return (
            <section
                ref={ref}
                id={id}
                className={cn(
                    "py-16 px-6 md:px-12 theme-transition overflow-x-hidden",
                    className
                )}
            >
                {children}
            </section>
        );
    }
);

Section.displayName = "Section";

export default Section;
