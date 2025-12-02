import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <div className="px-6">
          <div className="relative">
            <div className="flex gap-4 border-b border-slate-200">
              <button
                onClick={() => setTab("login")}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  tab === "login" ? "text-teal-500" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Login
              </button>

              <button
                onClick={() => setTab("signup")}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  tab === "signup" ? "text-teal-500" : "text-slate-500 hover:text-slate-700"
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
    </div>
  )
}

function LoginFields({ firstMount }: { firstMount: boolean }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: firstMount ? 0.1 : 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <CardContent className="px-6 pb-6">
        <div className="flex flex-col gap-5">

          <motion.div variants={itemVariants} className="grid gap-2">
            <Label htmlFor="login-email">Email</Label>
            <Input id="login-email" type="email" placeholder="m@example.com" className="h-10" />
          </motion.div>

          <motion.div variants={itemVariants} className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <a className="text-xs text-slate-600 hover:underline">Forgot?</a>
            </div>
            <Input id="login-password" type="password" className="h-10" />
          </motion.div>

        </div>
      </CardContent>

      <CardFooter className="flex-col gap-3 px-6 pb-6">

        <motion.div variants={itemVariants} className="w-full">
          <Button variant="outline" className="w-full h-10">
            Login with Google
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full">
          <Button className="w-full h-10">
            Login
          </Button>
        </motion.div>

      </CardFooter>
    </motion.div>
  )
}

function SignupFields({ firstMount }: { firstMount: boolean }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: firstMount ? 0.1 : 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <CardContent className="px-6 pb-6">
        <div className="flex flex-col gap-5">

          <motion.div variants={itemVariants} className="grid gap-2">
            <Label>Name</Label>
            <Input type="text" placeholder="John Doe" className="h-10" />
          </motion.div>

          <motion.div variants={itemVariants} className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" placeholder="m@example.com" className="h-10" />
          </motion.div>

          <motion.div variants={itemVariants} className="grid gap-2">
            <Label>Password</Label>
            <Input type="password" className="h-10" />
          </motion.div>

          <motion.div variants={itemVariants} className="grid gap-2">
            <Label>Confirm Password</Label>
            <Input type="password" className="h-10" />
          </motion.div>

        </div>
      </CardContent>

      <CardFooter className="flex-col gap-3 px-6 pb-6">

        <motion.div variants={itemVariants} className="w-full">
          <Button variant="outline" className="w-full h-10">
            Sign up with Google
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full">
          <Button className="w-full h-10">
            Sign up
          </Button>
        </motion.div>

      </CardFooter>
    </motion.div>
  )
}
