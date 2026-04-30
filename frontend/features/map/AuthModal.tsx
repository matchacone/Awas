'use client'

import { useState } from 'react'
import { X, Eye, EyeSlash } from '@phosphor-icons/react'
import supabase from '@/lib/supabaseClient'

interface AuthModalProps {
  onClose: () => void
  onLogin: (user: { email: string }) => void
}

type AuthView = 'login' | 'signup'

export default function AuthModal({ onClose, onLogin }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('login')

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Signup fields
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Error & Loading state
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin() {
    setError('')
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setIsLoading(true)
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginIdentifier.trim(),
      password: loginPassword.trim(),
    })
    setIsLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (data.user) {
      onLogin({ email: data.user.email ?? '' })
    }
  }

  async function handleSignup() {
    setError('')
    if (
      !email.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !username.trim() ||
      !signupPassword ||
      !confirmPassword
    ) {
      setError('Please fill in all fields.')
      return
    }
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsLoading(true)
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: signupPassword,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: username.trim(),
        }
      }
    })
    setIsLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (data.user) {
      onLogin({ email: data.user.email ?? '' })
    }
  }

  function switchToSignup() {
    setView('signup')
    setError('')
  }
  function switchToLogin() {
    setView('login')
    setError('')
  }

  const inputClass =
    'w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/25 focus:bg-white/[0.08] transition-colors'

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1117] border border-white/10 rounded-2xl w-[90%] max-w-md overflow-hidden shadow-2xl shadow-black/40"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-base font-bold text-white tracking-wide">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          {view === 'login' ? (
            /* ── LOGIN FORM ── */
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Email or Username
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass + ' pr-10'}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showLoginPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-xs font-medium">{error}</p>
              )}

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="h-10 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-bold tracking-wider uppercase hover:bg-white/20 transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <p className="text-center text-zinc-500 text-xs mt-1">
                Don&apos;t have an account?{' '}
                <button
                  onClick={switchToSignup}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </>
          ) : (
            /* ── SIGNUP FORM ── */
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Jian Bryce"
                    className={inputClass}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Machacon"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="jianbryce"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass + ' pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showSignupPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass + ' pr-10'}
                    onKeyDown={e => e.key === 'Enter' && handleSignup()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-xs font-medium">{error}</p>
              )}

              <button
                onClick={handleSignup}
                disabled={isLoading}
                className="h-10 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-bold tracking-wider uppercase hover:bg-white/20 transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>

              <p className="text-center text-zinc-500 text-xs mt-1">
                Already have an account?{' '}
                <button
                  onClick={switchToLogin}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                >
                  Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
