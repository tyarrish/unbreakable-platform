import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { APP_NAME } from '@/lib/constants'

export const metadata = {
  title: `Forgot Password - ${APP_NAME}`,
  description: 'Reset your RLTE password',
}

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <ForgotPasswordForm />
      <p className="text-center text-sm text-rogue-cream">
        Rogue Leadership Training Experience © {new Date().getFullYear()}
      </p>
    </div>
  )
}

