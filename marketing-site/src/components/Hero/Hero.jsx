import { useState } from 'react'
import Navbar from '../Navbar/Navbar'
import Button from '../Button/Button'
import Toast from '../Toast/Toast'
import { upsertMailerLiteSubscriber } from '../../services/mailerlite'
import bgCircles from '../../assets/badb79d76cb3d7859a870ccf6e97a6a33bd0237b.svg'
import plantImg from '../../assets/d0b4c2265cd3f4d0c3135c2314b1a3bc055f0b96.webp'
import './Hero.css'

export default function Hero() {
  const [toastVisible, setToastVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [toastMessage, setToastMessage] = useState('Binnenkort beschikbaar!')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showToast = (message = 'Binnenkort beschikbaar!') => {
    setToastMessage(message)
    setToastVisible(true)
  }

  const handleSubscribe = async (e) => {
    e.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || isSubmitting) return

    setIsSubmitting(true)
    try {
      await upsertMailerLiteSubscriber(normalizedEmail)
      showToast('Dank je voor je inschrijving! We nemen snel contact op.')
      setEmail('')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('MailerLite subscribe failed:', error)
      showToast(error.message || 'Inschrijving mislukt. Probeer het later opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="hero">
      <Toast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />
      <div className="hero__background">
        <img src={bgCircles} alt="Decoratieve achtergrondcirkels" />
      </div>
      <div className="hero__plant">
        <img src={plantImg} alt="Plant in een terracotta pot" />
      </div>
      <Navbar />
      <div className="hero__content">
        <div className="hero__text">
          <h1 className="hero__title">Laat ruimte groeien.</h1>
          <p className="hero__subtitle">
            Groene Vingers verbindt tuineigenaars met mensen die willen tuinieren. Zo krijgen ongebruikte tuinen opnieuw een plek waar mensen kunnen tuinieren, leren en groeien.
          </p>
        </div>
        <div className="hero__actions">
          <form className="hero__search" onSubmit={handleSubscribe}>
            <div className="hero__search-inner">
              <input
                type="email"
                className="hero__search-input"
                placeholder="Voer je email in voor meer info"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <span className="hero__search-button">
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Bezig...' : 'Abonneer'}
              </Button>
            </span>
          </form>
          <div className="hero__buttons">
            <Button variant="primary" onClick={() => window.open('https://www.figma.com/proto/vNIODWdJhOTDoLXEP7bky6/Bachelorproef?page-id=679%3A498&node-id=979-1707&viewport=324%2C338%2C0.11&t=2JqO0qBYmzW9QupP-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=979%3A1707&show-proto-sidebar=0', '_blank')}>Ontdek de app</Button>
            <Button variant="secondary" onClick={() => document.getElementById('hoe-werkt-het')?.scrollIntoView({ behavior: 'smooth' })}>Hoe werkt het?</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
