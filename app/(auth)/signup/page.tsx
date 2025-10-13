import { SignupForm } from '@/components/auth/signup-form'
import { APP_NAME } from '@/lib/constants'

export const metadata = {
  title: `Sign Up - ${APP_NAME}`,
  description: 'Create your RLTE account',
}

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <SignupForm />
      <p className="text-center text-sm text-rogue-cream">
        Rogue Leadership Training Experience © {new Date().getFullYear()}
      </p>
    </div>
  )
}

