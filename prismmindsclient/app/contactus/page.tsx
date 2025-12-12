"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Globe,
  ArrowLeft,
  Linkedin,
  Github,
  Twitter,
} from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import emailjs from "@emailjs/browser";

// --- Types
interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

interface TeamMember {
  name: string;
  role: string;
  image: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  highlight?: boolean;
}

// --- Orb motion
const orbTransition = {
  duration: 18,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: "easeInOut" as const,
};

// --- Team data (placeholder images/links)
const TEAM: TeamMember[] = [
  {
    name: "Alex Carter",
    role: "Founder",
    image: "/images/founder.jpg",
    linkedin: "#",
    twitter: "#",
    github: "#",
    highlight: true,
  },
  {
    name: "Sofia Bennett",
    role: "Co-Founder & CEO",
    image: "/images/ceo.jpg",
    linkedin: "#",
    twitter: "#",
    github: "#",
  },
  {
    name: "Ethan Riley",
    role: "Co-Founder & CTO",
    image: "/images/cto.jpg",
    linkedin: "#",
    twitter: "#",
    github: "#",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const cardRotateX = useTransform(tiltY, (v) => -v / 12);
  const cardRotateY = useTransform(tiltX, (v) => v / 12);

  const btnX = useMotionValue(0);
  const btnY = useMotionValue(0);
  const btnScale = useTransform(btnX, [-20, 20], [0.98, 1.02]);

  const shimmerX = useMotionValue(0);
  const [focused, setFocused] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const result = await emailjs.send(
        "service_48tm6vv",
        "template_ijxzaxi",
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        "GPglvP4vgVbAQ5kKU"
      );

      console.log("Email sent:", result.text);
      setSuccessMessage("Your message has been sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch (error) {
      console.error("Error sending email:", error);
      setSuccessMessage("Failed to send message. Please try again later.");
      setTimeout(() => setSuccessMessage(""), 4000);
    }

    setIsSubmitting(false);
  };

  const handleCardPointerMove = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    tiltX.set(x / (rect.width / 2));
    tiltY.set(y / (rect.height / 2));
    shimmerX.set((x / rect.width) * 100);
  };

  const handleCardPointerLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
    shimmerX.set(0);
  };

  const handleBtnMove = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    btnX.set(x / 6);
    btnY.set(y / 6);
  };

  const handleBtnLeave = () => {
    btnX.set(0);
    btnY.set(0);
  };

  const inputClassBase =
    "w-full px-4 pt-5 pb-2 text-sm rounded-xl bg-white/60 border backdrop-blur-xl shadow-inner outline-none transition-all duration-200";

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-white via-neutral-50 to-neutral-100 overflow-hidden">

      {/* BACK BUTTON */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-6 right-6 md:top-8 md:right-10 z-50"
      >
        <Link
          href="/"
          className="flex items-center gap-[6px] text-neutral-600 hover:text-black transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </motion.div>

      {/* FLOATING ORBS */}
      <motion.div
        className="absolute top-8 left-8 w-72 h-72 bg-amber-300/18 rounded-full blur-3xl pointer-events-none"
        animate={{ x: [0, 12, -10, 0], y: [0, 10, -8, 0] }}
        transition={orbTransition}
      />
      <motion.div
        className="absolute bottom-16 right-8 w-80 h-80 bg-sky-300/14 rounded-full blur-3xl pointer-events-none"
        animate={{ x: [0, -16, 10, 0], y: [0, -12, 6, 0] }}
        transition={{ ...orbTransition, duration: 22 }}
      />

      {/* HERO */}
      <section className="py-12 md:py-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight"
        >
          Let’s{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text">
            Connect
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="text-neutral-600 mt-3 max-w-2xl mx-auto"
        >
          Quick questions, big ideas, or a project brief — we’re ready.
        </motion.p>
      </section>

      {/* MAIN GRID */}
      <section className="px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 pb-12">

        {/* FORM */}
        <motion.div
          onMouseMove={handleCardPointerMove}
          onMouseLeave={handleCardPointerLeave}
          style={{ rotateX: cardRotateX, rotateY: cardRotateY, perspective: 1200 }}
          className="relative rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 p-6 md:p-8 
                     shadow-lg hover:shadow-[0_14px_40px_rgba(2,6,23,0.08)] transition-transform"
        >
          {/* SHIMMER */}
          <motion.div
            style={{ left: shimmerX }}
            className="pointer-events-none absolute inset-y-0 -left-24 w-64 bg-gradient-to-r 
                       from-white/0 via-white/30 to-white/0 opacity-30 blur-xl transform -translate-x-1/2"
          />

          <h3 className="text-2xl md:text-3xl font-semibold mb-4">Send a Message</h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* NAME */}
            <div className="relative">
              <input
                name="name"
                placeholder=" "
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onFocus={() => setFocused("name")}
                onBlur={() => focused === "name" && setFocused(null)}
                className={`${inputClassBase} ${errors.name ? "border-red-400" : "border-neutral-300"}`}
              />
              <label
                className={`absolute left-4 text-xs text-neutral-600 transition-all pointer-events-none 
                ${formData.name ? "top-0 text-[11px]" : "top-3"}`}
              >
                Full Name
              </label>
              <motion.span
                animate={{ width: focused === "name" ? "100%" : 0, opacity: focused === "name" ? 1 : 0 }}
                className="block h-[2px] bg-amber-400 absolute bottom-0 left-0 rounded origin-left"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* EMAIL */}
            <div className="relative">
              <input
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setFocused("email")}
                onBlur={() => focused === "email" && setFocused(null)}
                className={`${inputClassBase} ${errors.email ? "border-red-400" : "border-neutral-300"}`}
              />
              <label
                className={`absolute left-4 text-xs text-neutral-600 transition-all pointer-events-none 
                ${formData.email ? "top-0 text-[11px]" : "top-3"}`}
              >
                Email Address
              </label>
              <motion.span
                animate={{ width: focused === "email" ? "100%" : 0, opacity: focused === "email" ? 1 : 0 }}
                className="block h-[2px] bg-sky-400 absolute bottom-0 left-0 rounded origin-left"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* SUBJECT */}
            <div className="relative">
              <input
                name="subject"
                placeholder=" "
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                onFocus={() => setFocused("subject")}
                onBlur={() => focused === "subject" && setFocused(null)}
                className={`${inputClassBase} ${errors.subject ? "border-red-400" : "border-neutral-300"}`}
              />
              <label
                className={`absolute left-4 text-xs text-neutral-600 transition-all pointer-events-none 
                ${formData.subject ? "top-0 text-[11px]" : "top-3"}`}
              >
                Subject
              </label>
              <motion.span
                animate={{ width: focused === "subject" ? "100%" : 0, opacity: focused === "subject" ? 1 : 0 }}
                className="block h-[2px] bg-amber-400 absolute bottom-0 left-0 rounded origin-left"
              />
              {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
            </div>

            {/* MESSAGE */}
            <div className="relative">
              <textarea
                name="message"
                rows={4}
                placeholder=" "
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                onFocus={() => setFocused("message")}
                onBlur={() => focused === "message" && setFocused(null)}
                className={`${inputClassBase} ${errors.message ? "border-red-400" : "border-neutral-300"
                  } resize-none`}
              />
              <label
                className={`absolute left-4 text-xs text-neutral-600 transition-all pointer-events-none 
                ${formData.message ? "top-0 text-[11px]" : "top-3"}`}
              >
                Message
              </label>
              <motion.span
                animate={{ width: focused === "message" ? "100%" : 0, opacity: focused === "message" ? 1 : 0 }}
                className="block h-[2px] bg-emerald-400 absolute bottom-0 left-0 rounded origin-left"
              />
              {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
            </div>

            {/* BUTTON */}
            <motion.div
              style={{ x: btnX, y: btnY, scale: btnScale }}
              onMouseMove={handleBtnMove}
              onMouseLeave={handleBtnLeave}
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="relative overflow-hidden w-full py-3 rounded-xl text-sm font-semibold 
                           shadow-lg bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-900 hover:shadow-xl transition"
              >
                <motion.span
                  style={{ x: shimmerX }}
                  className="absolute -left-24 top-0 h-full w-36 bg-white/25 mix-blend-screen blur-[6px] pointer-events-none"
                />
                <span className="relative z-10 inline-flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </span>
              </Button>
            </motion.div>
          </form>

          {/* SUCCESS MESSAGE */}
          <div className="w-full text-center">
            {successMessage && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm mt-3 text-emerald-600 font-medium"
              >
                {successMessage}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* CONTACT INFO */}
        <div className="space-y-5">
          {[
            { icon: Mail, title: "Email", text: "contact@prismmindai.com" },
            { icon: Phone, title: "Phone", text: "+91 (555) 123-4567" },
            { icon: MapPin, title: "Location", text: "Hyderabad, India" },
            { icon: Globe, title: "Website", text: "www.prismmindai.com" },
          ].map((item) => (
            <motion.div
              key={item.title}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.22 }}
              className="p-4 md:p-5 bg-white/75 backdrop-blur-xl rounded-xl border border-neutral-200 shadow-sm flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-300/20 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">{item.title}</h4>
                <p className="text-neutral-600 text-sm">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
            Meet the <span className="text-purple-600">PrismMinds Team</span>
          </h2>

          <p className="text-neutral-600 mt-3 max-w-2xl mx-auto text-lg">
            A visionary team shaping intelligent, future-ready products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">

          {/* CO-FOUNDER */}
          <div
            className="group p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm 
                 hover:shadow-lg transition-all text-center"
          >
            {/* IMAGE WRAPPER */}
            <div className="inline-block">
              <img
                src="teams/co-founder.jpg"
                className="
            w-28 h-28 rounded-full object-cover mx-auto mb-5 border-4 border-neutral-300
            transition-all duration-500
            group-hover:border-[#F2C94C]
            group-hover:shadow-[0_0_28px_6px_rgba(242,201,76,0.45)]
          "
              />
            </div>

            <h3 className="text-lg font-semibold text-neutral-900">Mr. Charan Ramagiri</h3>
            <p className="text-neutral-500 text-sm mb-5">Co-Founder of PrismMinds</p>

            <div className="flex justify-center gap-5">
              <a href="https://www.linkedin.com/in/charan-ramagiri/" target="_blank" className="hover:scale-110 transition">
                <Linkedin className="w-6 h-6" style={{ color: "#0A66C2" }} />
              </a>
            </div>
          </div>

          {/* FOUNDER */}
          <div
            className="group p-10 rounded-2xl bg-white border border-neutral-300 shadow-md 
                 hover:shadow-2xl transition-all text-center"
          >
            <div className="inline-block">
              <img
                src="teams/founder.jpg"
                className="
            w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-neutral-300
            transition-all duration-500
            group-hover:border-[#F2C94C]
            group-hover:shadow-[0_0_35px_8px_rgba(242,201,76,0.55)]
          "
              />
            </div>

            <h3 className="text-xl font-semibold text-neutral-900">Mr. Jayanth Devupalli</h3>
            <p className="text-neutral-500 text-sm mb-6">Founder of PrismMinds</p>

            <div className="flex justify-center gap-5">
              <a href="https://www.linkedin.com/in/devupallijayanth/" target="_blank" className="hover:scale-125 transition">
                <Linkedin className="w-7 h-7" style={{ color: "#0A66C2" }} />
              </a>
            </div>
          </div>

          {/* CEO */}
          <div
            className="group p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm 
                 hover:shadow-lg transition-all text-center"
          >
            <div className="inline-block">
              <img
                src="teams/ceo.jpg"
                className="
            w-28 h-28 rounded-full object-cover mx-auto mb-5 border-4 border-neutral-300
            transition-all duration-500
            group-hover:border-[#F2C94C]
            group-hover:shadow-[0_0_28px_6px_rgba(242,201,76,0.45)]
          "
              />
            </div>

            <h3 className="text-lg font-semibold text-neutral-900">Mr. Praveen Kanneboina</h3>
            <p className="text-neutral-500 text-sm mb-5">CEO of PrismMinds</p>

            <div className="flex justify-center gap-5">
              <a
                href="https://www.linkedin.com/in/praveen-kanneboina-384319301/"
                target="_blank"
                className="hover:scale-110 transition"
              >
                <Linkedin className="w-6 h-6" style={{ color: "#0A66C2" }} />
              </a>
            </div>
          </div>

        </div>
      </section>


      <footer className="text-center py-8 text-neutral-500">
        © 2025 PrismMinds
      </footer>
    </main>
  );
}
