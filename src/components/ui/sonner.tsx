'use client'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:glass-card group-[.toaster]:text-sky-900 group-[.toaster]:border-sky-200/50 group-[.toaster]:shadow-glass',
          description: 'group-[.toast]:text-sky-600/70',
          actionButton:
            'group-[.toast]:glass-button group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:glass-button-secondary group-[.toast]:text-sky-700',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
