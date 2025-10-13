import { LoginForm } from '@/components/auth/login-form'
import { APP_NAME } from '@/lib/constants'

export const metadata = {
  title: `Login - ${APP_NAME}`,
  description: 'Sign in to your RLTE account',
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <LoginForm />
      <p className="text-center text-sm text-rogue-cream">
        Rogue Leadership Training Experience © {new Date().getFullYear()}
      </p>
    </div>
  )
}

