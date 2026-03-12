import { useState } from 'react'
import SectionHeader from '../SectionHeader/SectionHeader'
import Button from '../Button/Button'
import Toast from '../Toast/Toast'
import iconGratis from '../../assets/8d75e753870d5d6108adfc829bb72987b196736f.svg'
import iconGebruiker from '../../assets/7ba04395393b926a3fa0788a8ac352681bae370a.svg'
import './Pricing.css'

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" stroke="#576238" strokeWidth="2" />
      <path d="M10 16l4 4 8-8" stroke="#576238" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" stroke="#b5b8a7" strokeWidth="2" />
      <path d="M12 12l8 8M20 12l-8 8" stroke="#b5b8a7" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const plans = [
  {
    icon: iconGratis,
    name: 'Gratis',
    price: '€0',
    period: 'Per maand',
    buttonVariant: 'outline',
    features: [
      { text: 'Tuinen bekijken & zoeken', included: true },
      { text: 'Matchen met tuin eigenaar', included: false },
      { text: 'Logboek behouden', included: false },
    ],
  },
  {
    icon: iconGebruiker,
    name: 'Gebruiker',
    price: '€7',
    period: 'Per maand',
    buttonVariant: 'primary',
    features: [
      { text: 'Tuinen bekijken & zoeken', included: true },
      { text: 'Matchen met tuin eigenaar', included: true },
      { text: 'Logboek bijhouden', included: true },
    ],
  },
]

export default function Pricing() {
  const [toastVisible, setToastVisible] = useState(false)

  const showToast = () => setToastVisible(true)

  return (
    <section className="pricing">
      <Toast message="Binnenkort beschikbaar!" visible={toastVisible} onClose={() => setToastVisible(false)} />
      <div className="pricing__inner">
        <SectionHeader
          label="Pricing"
          title="Kies jouw plan"
          description="Begin gratis en upgrade wanneer je meer wilt."
        />
        <div className="pricing__cards">
          {plans.map((plan, i) => (
            <div className="pricing__card" key={i}>
              <div className="pricing__card-icon">
                <img src={plan.icon} alt="" />
              </div>
              <div className="pricing__card-divider" />
              <div className="pricing__card-content">
                <div className="pricing__card-header">
                  <h3 className="pricing__card-name">{plan.name}</h3>
                  <span className="pricing__card-price">
                    {plan.price} <span className="pricing__card-period">/ {plan.period}</span>
                  </span>
                </div>
                <Button variant={plan.buttonVariant} rounded fullWidth onClick={showToast}>
                  Registreer nu
                </Button>
                <div className="pricing__card-features">
                  {plan.features.map((feature, j) => (
                    <div className={`pricing__card-feature ${!feature.included ? 'pricing__card-feature--disabled' : ''}`} key={j}>
                      <div className="pricing__card-feature-icon">
                        {feature.included ? <CheckIcon /> : <XIcon />}
                      </div>
                      <span className="pricing__card-feature-text">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
