"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { MessageCircle } from "lucide-react";

// Administrator WhatsApp number - replace with actual number
const WHATSAPP_NUMBER = "251929945151";

type ContactMode = "services" | "training";

interface ContactProps {
    mode?: ContactMode;
}

export default function Contact({ mode = "services" }: ContactProps) {
    const { t, language } = useLanguage();
    const { isDark } = useTheme();
const interestOptions = useMemo(() => mode === "training"
        ? [
            { value: "pro", label: "Executive Management" },
            { value: "basic", label: "Service Foundations" },
            { value: "intermediate", label: "Fine Dining & Service" },
            { value: "zero2hero", label: "Zero2Hero Full Practice" },
        ]
        : [
            { value: "seats", label: "Villa & Room Booking" },
            { value: "dashboard", label: "Staffing & AI Dashboard" },
            { value: "provenance", label: "Local Provenance Inquiry" },
            { value: "management", label: "Resort Management" },
        ], [mode]);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        interest: interestOptions[0].value,
        message: "",
    });

    useEffect(() => {
        const handleSelectInterest = (e: Event) => {
            const value = (e as CustomEvent).detail;
            if (interestOptions.some((opt) => opt.value === value)) {
                setFormData((prev) => ({ ...prev, interest: value }));
            }
        };
        window.addEventListener("select-interest", handleSelectInterest);
        return () => window.removeEventListener("select-interest", handleSelectInterest);
    }, [interestOptions]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Format the message for WhatsApp
        const interestLabels: Record<string, string> = Object.fromEntries(
            interestOptions.map((option) => [option.value, option.label])
        );

        const message = `
    *New Booking Inquiry from VAGUE Resort Website*
━━━━━━━━━━━━━━━━━━━━

*Name:* ${formData.name}
*Phone:* ${formData.phone}
*Email:* ${formData.email}
*Interest:* ${interestLabels[formData.interest] || formData.interest}

*Message:*
${formData.message}
        `.trim();

        // Encode the message and create WhatsApp URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        // Open WhatsApp in a new tab
        window.open(whatsappUrl, "_blank");
    };

    return (
        <Section id="contact" className={isDark ? "bg-black text-white" : "bg-white text-black"}>
            <div className="max-w-3xl mx-auto text-center" lang={language}>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
                    Get in <span className={isDark ? "text-neutral-500" : "text-neutral-400"}>Touch</span>
                </h2>
                <p className={`mb-12 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Experience the future of resort management and localized luxury.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className={`text-sm font-medium uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-600"}`}>
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-colors ${isDark ? "bg-neutral-900 border-white/10 text-white focus:border-white/30" : "bg-neutral-100 border-black/10 text-black focus:border-black/30"}`}
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="phone" className={`text-sm font-medium uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-600"}`}>
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-colors ${isDark ? "bg-neutral-900 border-white/10 text-white focus:border-white/30" : "bg-neutral-100 border-black/10 text-black focus:border-black/30"}`}
                                placeholder="+251 ..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className={`text-sm font-medium uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-600"}`}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-colors ${isDark ? "bg-neutral-900 border-white/10 text-white focus:border-white/30" : "bg-neutral-100 border-black/10 text-black focus:border-black/30"}`}
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="interest" className={`text-sm font-medium uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-600"}`}>
                            Interested In
                        </label>
                        <select
                            id="interest"
                            value={formData.interest}
                            onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-colors ${isDark ? "bg-neutral-900 border-white/10 text-white focus:border-white/30" : "bg-neutral-100 border-black/10 text-black focus:border-black/30"}`}
                        >
                            {interestOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="message" className={`text-sm font-medium uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-600"}`}>
                            Message
                        </label>
                        <textarea
                            id="message"
                            rows={4}
                            required
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-colors resize-none ${isDark ? "bg-neutral-900 border-white/10 text-white focus:border-white/30 placeholder:text-neutral-500" : "bg-neutral-100 border-black/10 text-black focus:border-black/30 placeholder:text-neutral-500"}`}
                            placeholder="How can we help you?"
                        />
                    </div>

                    <div className="text-center pt-8">
                        <Button type="submit" variant="primary" className="w-full md:w-auto gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Send Message
                        </Button>
                        <p className={`text-xs mt-4 ${isDark ? "text-neutral-600" : "text-neutral-500"}`}>
                            Your message will be sent directly via WhatsApp
                        </p>
                    </div>
                </form>
            </div>
        </Section>
    );
}
