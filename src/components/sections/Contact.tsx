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
            { value: "pro", label: t("training.course.pro") },
            { value: "basic", label: t("training.course.basic") },
            { value: "intermediate", label: t("training.course.intermediate") },
            { value: "zero2hero", label: t("training.course.zero2hero") },
        ]
        : [
            { value: "seats", label: t("contact.interest.seats") },
            { value: "dashboard", label: t("contact.interest.dashboard") },
            { value: "roofline", label: t("contact.interest.roofline") },
            { value: "doors", label: t("contact.interest.doors") },
            { value: "steering", label: t("contact.interest.steering") },
            { value: "fullInterior", label: t("contact.interest.fullInterior") },
            { value: "architectural", label: t("contact.interest.architectural") },
        ], [mode, t]);

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
                    {t("contact.title1")} <span className={isDark ? "text-neutral-500" : "text-neutral-400"}>{t("contact.title2")}</span>
                </h2>
                <p className={`mb-12 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    {t("contact.subtitle")}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className={`text-sm font-medium uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-600"}`}>
                                {t("contact.name")}
                            </label>
                            <input
                                type="text"
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-colors ${isDark ? "bg-neutral-900 border-white/10 text-white focus:border-white/30" : "bg-neutral-100 border-black/10 text-black focus:border-black/30"}`}
                                placeholder={t("contact.name.placeholder")}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="phone" className={`text-sm font-medium uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-600"}`}>
                                {t("contact.phone")}
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-colors ${isDark ? "bg-neutral-900 border-white/10 text-white focus:border-white/30" : "bg-neutral-100 border-black/10 text-black focus:border-black/30"}`}
                                placeholder={t("contact.phone.placeholder")}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className={`text-sm font-medium uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-600"}`}>
                            {t("contact.email")}
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-colors ${isDark ? "bg-neutral-900 border-white/10 text-white focus:border-white/30" : "bg-neutral-100 border-black/10 text-black focus:border-black/30"}`}
                            placeholder={t("contact.email.placeholder")}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="interest" className={`text-sm font-medium uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-600"}`}>
                            {t("contact.interest")}
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
                            {t("contact.message")}
                        </label>
                        <textarea
                            id="message"
                            rows={4}
                            required
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-colors resize-none ${isDark ? "bg-neutral-900 border-white/10 text-white focus:border-white/30 placeholder:text-neutral-500" : "bg-neutral-100 border-black/10 text-black focus:border-black/30 placeholder:text-neutral-500"}`}
                            placeholder={t("contact.message.placeholder")}
                        />
                    </div>

                    <div className="text-center pt-8">
                        <Button type="submit" variant="primary" className="w-full md:w-auto gap-2">
                            <MessageCircle className="w-4 h-4" />
                            {t("contact.submit")}
                        </Button>
                        <p className={`text-xs mt-4 ${isDark ? "text-neutral-600" : "text-neutral-500"}`}>
                            {language === "en"
                                ? "Your message will be sent directly via WhatsApp"
                                : "መልዕክትዎ በቀጥታ በዋትስአፕ ይላካል"}
                        </p>
                    </div>
                </form>
            </div>
        </Section>
    );
}
