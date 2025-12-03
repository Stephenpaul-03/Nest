import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import LoginFields from "./loginFields"
import SignupFields from "./signupFields"

export default function AuthCard() {
  const [tab, setTab] = useState<"login" | "signup">("login")
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | "auto">("auto")

  const [firstMount, setFirstMount] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setFirstMount(false), 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (contentRef.current) {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (entry) setHeight(entry.contentRect.height)
      })

      observer.observe(contentRef.current)
      return () => observer.disconnect()
    }
  }, [])

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <div className="px-6">
        <div className="relative">
          <div className="flex gap-4 border-b border-slate-200">
            <button
              onClick={() => setTab("login")}
              className={`pb-3 text-sm font-medium transition-colors relative ${tab === "login" ? "text-teal-500" : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Login
            </button>

            <button
              onClick={() => setTab("signup")}
              className={`pb-3 text-sm font-medium transition-colors relative ${tab === "signup" ? "text-teal-500" : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Signup
            </button>
          </div>
        </div>
      </div>

      <motion.div
        animate={{ height }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="overflow-hidden"
      >
        <div ref={contentRef}>
          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LoginFields firstMount={firstMount} />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SignupFields firstMount={firstMount} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </Card>
  )
}


