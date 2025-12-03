
import { motion} from "framer-motion"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginFields({ firstMount }: { firstMount: boolean }) {
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