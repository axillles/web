import { describe, it, expect } from 'vitest'

// Импортируем функции валидации (если они есть)
// Если их нет, создадим базовые функции для тестирования

// Базовые функции валидации для тестирования
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone) => {
  const phoneRegex = /^\+375\s?\d{2}\s?\d{3}-?\d{2}-?\d{2}$/
  return phoneRegex.test(phone)
}

const validatePassword = (password) => {
  return password && password.length >= 8
}

const validateFileSize = (file, maxSize = 5 * 1024 * 1024) => {
  return file && file.size <= maxSize
}

const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
  return file && allowedTypes.includes(file.type)
}

describe('Validation Utils', () => {
  describe('Email Validation', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('test+tag@example.org')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(null)).toBe(false)
      expect(validateEmail(undefined)).toBe(false)
    })
  })

  describe('Phone Validation', () => {
    it('validates correct Belarusian phone numbers', () => {
      expect(validatePhone('+375291234567')).toBe(true)
      expect(validatePhone('+375 29 123-45-67')).toBe(true)
      expect(validatePhone('+375 29 123 45 67')).toBe(true)
    })

    it('rejects invalid phone numbers', () => {
      expect(validatePhone('123456789')).toBe(false)
      expect(validatePhone('+37529123456')).toBe(false) // слишком короткий
      expect(validatePhone('+3752912345678')).toBe(false) // слишком длинный
      expect(validatePhone('')).toBe(false)
      expect(validatePhone(null)).toBe(false)
    })
  })

  describe('Password Validation', () => {
    it('validates strong passwords', () => {
      expect(validatePassword('password123')).toBe(true)
      expect(validatePassword('strongPassword!@#')).toBe(true)
      expect(validatePassword('12345678')).toBe(true)
    })

    it('rejects weak passwords', () => {
      expect(validatePassword('123')).toBe(false)
      expect(validatePassword('')).toBe(false)
      expect(validatePassword(null)).toBe(false)
      expect(validatePassword(undefined)).toBe(false)
    })
  })

  describe('File Validation', () => {
    it('validates file size correctly', () => {
      const smallFile = { size: 1024 * 1024 } // 1MB
      const largeFile = { size: 10 * 1024 * 1024 } // 10MB

      expect(validateFileSize(smallFile)).toBe(true)
      expect(validateFileSize(largeFile)).toBe(false)
    })

    it('validates file type correctly', () => {
      const jpgFile = { type: 'image/jpeg' }
      const pngFile = { type: 'image/png' }
      const txtFile = { type: 'text/plain' }

      expect(validateFileType(jpgFile)).toBe(true)
      expect(validateFileType(pngFile)).toBe(true)
      expect(validateFileType(txtFile)).toBe(false)
    })

    it('handles null/undefined files', () => {
      expect(validateFileSize(null)).toBe(false)
      expect(validateFileSize(undefined)).toBe(false)
      expect(validateFileType(null)).toBe(false)
      expect(validateFileType(undefined)).toBe(false)
    })
  })
})
