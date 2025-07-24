import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateShortHash(): string {
  return crypto.randomBytes(16).toString('hex')
}

export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return ''
  
  return text
    .trim()
    .replace(/[<>&"']/g, (match) => {
      const entityMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;'
      }
      return entityMap[match]
    })
    .replace(/\0/g, '') // Remove null bytes
    .slice(0, 1000) // Limit length to prevent memory issues
}

export function validateEmail(email: string): boolean {
  if (typeof email !== 'string') return false
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email) && email.length <= 254
}

export function validateInput(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') return ''
  return sanitizeText(input).slice(0, maxLength)
}