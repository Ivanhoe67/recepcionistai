'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Loader2, Sparkles, Mail, Lock, User } from 'lucide-react'

import { signupSchema, SignupInput } from '../types'
import { signUp } from '../services/auth.service'

export function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  })

  async function onSubmit(data: SignupInput) {
    setIsLoading(true)
    setError(null)

    const result = await signUp(data)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="glass-card p-8 animate-scale-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <img src="/logo.svg" alt="RecepcionistAI" className="w-full h-full" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
          Únete a RecepcionistAI
        </h1>
        <p className="text-sky-600/70 mt-2">
          Crea tu cuenta y empieza a capturar leads 24/7
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="glass-badge-danger px-4 py-3 rounded-xl text-sm w-full block">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium text-sky-800">
            Nombre Completo
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-sky-400" />
            <input
              id="fullName"
              type="text"
              placeholder="Juan Pérez"
              className="glass-input w-full pl-12"
              {...form.register('fullName')}
            />
          </div>
          {form.formState.errors.fullName && (
            <p className="text-sm text-red-500">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-sky-800">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-sky-400" />
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              className="glass-input w-full pl-12"
              {...form.register('email')}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-sky-800">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-sky-400" />
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="glass-input w-full pl-12"
              {...form.register('password')}
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="glass-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Creando cuenta...</span>
            </>
          ) : (
            <span>Crear Cuenta</span>
          )}
        </button>

        <p className="text-center text-sm text-sky-700">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-semibold text-sky-600 hover:text-sky-800 transition-colors"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  )
}
