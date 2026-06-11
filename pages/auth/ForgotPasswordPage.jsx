import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/store/toastStore'
import { validateEmail } from '@/utils/validators'

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [didSend, setDidSend] = useState(false)

  const handleSubmit = async () => {
    const emailError = validateEmail(email)
    if (emailError) {
      setErrors({ email: emailError })
      return
    }
    setErrors({})
    setIsSubmitting(true)
    try {
      await sendPasswordReset(email)
      setDidSend(true)
    } catch (error) {
      showToast({ message: error.message || 'Could not send reset email', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-lg py-2xl">
      <div className="flex flex-col gap-lg">
        <div className="flex flex-col gap-xs">
          <h1 className="text-heading font-bold text-text">Forgot password</h1>
          <p className="text-body text-muted">
            We'll send you a link to reset it.
          </p>
        </div>

        {didSend ? (
          <div className="flex flex-col gap-md">
            <p className="text-body text-text">
              Check your inbox for the reset link. It expires in 1 hour.
            </p>
            <Link to="/login" className="text-center text-label font-medium text-primary">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <form
              className="flex flex-col gap-md"
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
            >
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                error={errors.email}
                required
                autoFocus
              />
              <Button type="submit" isLoading={isSubmitting} fullWidth>
                Send reset link
              </Button>
            </form>

            <p className="text-center text-label text-muted">
              <Link to="/login" className="font-medium text-primary">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
