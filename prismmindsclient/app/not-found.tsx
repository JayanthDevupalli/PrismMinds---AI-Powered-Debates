"use client";

import Head from 'next/head';
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page Not Found - PrismMinds</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to PrismMinds AI debate platform." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#e0f2ff] via-[#f4e7ff] to-[#ffe6e6] p-6">

      {/* Floating SVG Blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 1.8 }}
        className="absolute -top-20 -left-20 w-72 h-72 bg-[#a5d8ff] blur-3xl rounded-full"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ delay: 0.4, duration: 1.8 }}
        className="absolute bottom-[-80px] right-[-80px] w-72 h-72 bg-[#ffc9de] blur-3xl rounded-full"
      />

      {/* Card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 backdrop-blur-xl bg-white/40 border border-white/30 shadow-xl rounded-3xl p-10 max-w-lg w-full text-center"
      >
        <h1 className="text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          404
        </h1>

        <p className="text-lg text-gray-700 mb-6">
          Oops! The page you're looking for doesn’t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all"
        >
          <ArrowLeft size={20} />
          Go Back Home
        </Link>
      </motion.div>
    </div>
    </>
  );
}
