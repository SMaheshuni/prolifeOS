import { Link } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { useLogin } from './auth.hooks'

export default function LoginPage() {
  const { email, password, errors, isSubmitting, setEmail, setPassword, handleSubmit } = useLogin()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-lg py-2xl">
      <div className="flex flex-col gap-lg">
        <div className="flex flex-col gap-xs">
          <h1 className="text-heading font-bold text-text">Welcome back</h1>
          <p className="text-body text-muted">Sign in to your LifeOS account</p>
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
            Sign in
          </Button>
        </form>

        <div className="flex flex-col items-center gap-sm text-label text-muted">
          <Link to="/forgot-password" className="font-medium text-primary">
            Forgot password?
          </Link>
          <p>
            New to LifeOS?{' '}
            <Link to="/signup" className="font-medium text-primary">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
