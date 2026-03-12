import Button from '../Button/Button'
import './CTA.css'

export default function CTA() {
  return (
    <section className="cta">
      <div className="cta__inner">
        <div className="cta__text">
          <h2 className="cta__title">Klaar om mee te groeien?</h2>
          <p className="cta__description">
            Ontdek wat mogelijk is wanneer buurtgenoten vertrouwen en groen met elkaar delen.
          </p>
        </div>
        <div className="cta__buttons">
          <Button variant="light" onClick={() => window.open('https://bachelorkaart.netlify.app/', '_blank')}>Bekijk het aanbod</Button>
          <Button variant="outline-light" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Neem contact op</Button>
        </div>
      </div>
    </section>
  )
}
