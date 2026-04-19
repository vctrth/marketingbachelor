import { useState } from 'react'
import Button from '../Button/Button'
import Toast from '../Toast/Toast'
import { upsertMailerLiteSubscriber } from '../../services/mailerlite'

export default function SubscribeForm({
  placeholder = 'Voer je email in',
  buttonText = 'Abonneer',
  successMessage = 'Dank je voor je inschrijving! We nemen snel contact op.',
  // Optional class overrides so the host component can reuse existing styles
  formClass = 'subscribe-form__form',
  innerClass = 'subscribe-form__inner',
  inputClass = 'subscribe-form__input',
  buttonWrapperClass = 'subscribe-form__button',
}) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState(successMessage)

  const showToast = (message) => {
    setToastMessage(message)
    setToastVisible(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const normalizedEmail = String(email || '').trim().toLowerCase()
    if (!normalizedEmail || isSubmitting) return

    setIsSubmitting(true)
    try {
      await upsertMailerLiteSubscriber(normalizedEmail)
      showToast(successMessage)
      setEmail('')
    } catch (error) {
      // Keep console error for debugging, show friendly toast
      // eslint-disable-next-line no-console
      console.error('MailerLite subscribe failed:', error)
      showToast(error?.message || 'Inschrijving mislukt. Probeer het later opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="subscribe-form">
      <Toast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />
      <form className={formClass} onSubmit={handleSubmit}>
        <div className={innerClass}>
          <input
            type="email"
            className={inputClass}
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <span className={buttonWrapperClass}>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Bezig...' : buttonText}
          </Button>
        </span>
      </form>
    </div>
  )
}
