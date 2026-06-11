import { Link } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { useSignup } from './auth.hooks'

export default function SignupPage() {
  const { email, password, errors, isSubmitting, setEmail, setPassword, handleSubmit } = useSignup()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-lg py-2xl">
      <div className="flex flex-col gap-lg">
        <div className="flex flex-col gap-xs">
          <h1 className="text-heading font-bold text-text">Create account</h1>
          <p className="text-body text-muted">Start tracking your health and habits</p>
        </div>

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
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            required
          />
          <Button type="submit" isLoading={isSubmitting} fullWidth>
            Create account
          </Button>
        </form>

        <p className="text-center text-label text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
