"use client"

import * as React from "react"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="Checkbox"
      className={`h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary ${className}`}
      {...props}
    />
  )
}
