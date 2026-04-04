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
               
            >
                {children}
            </section>
        );
    }
);

Section.displayName = "Section";

export default Section;
