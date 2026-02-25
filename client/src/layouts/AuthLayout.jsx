import { motion } from "framer-motion";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 dark:from-[#0f172a] dark:via-[#020617] dark:to-black px-4">

      {/* Decorative blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl p-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold text-dark dark:text-white">
              {title}
            </h1>
            <p className="text-sm text-accent dark:text-white/60 mt-1">
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </motion.div>
    </div>
  );
}