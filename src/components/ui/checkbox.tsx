"use client"

import * as React from "react"
import { InputHTMLAttributes } from "react"

// Remove empty interface and extend directly
export function Checkbox({ 
  className, 
  ...props 
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={`h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary ${className}`}
      {...props}
    />
  )
}
