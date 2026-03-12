import { useState, useEffect } from 'react'
import SectionHeader from '../SectionHeader/SectionHeader'
import Button from '../Button/Button'
import iconMail from '../../assets/65eedffa60749e5b6cc606fc1c1beeb9ddb420ce.svg'
import iconPhone from '../../assets/3c59b97f7a86e6a864e93f36bfd0862eaec5df54.svg'
import iconDownload from '../../assets/c0fa97aa1a59af56d5947d1c07772185db2d4e89.svg'
import iconTest from '../../assets/92113fdbb444f5ec2e4328ec3880df115825a8f0.svg'
import plantIcon from '../../assets/8d75e753870d5d6108adfc829bb72987b196736f.svg'
import './Contact.css'

const contactItems = [
  { icon: iconMail, text: 'info@groenevingers.be', href: 'mailto:info@groenevingers.be' },
  { icon: iconPhone, text: '+32 456 32 38 61', href: 'tel:+32456323861' },
  { icon: iconDownload, text: 'Download het onderzoeksrapport', href: '/onderzoeksrapport.pdf', download: true },
  { icon: iconTest, text: 'Test het product', href: 'https://www.figma.com/proto/vNIODWdJhOTDoLXEP7bky6/Bachelorproef?page-id=679%3A498&node-id=979-1707&viewport=324%2C338%2C0.11&t=2JqO0qBYmzW9QupP-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=979%3A1707&show-proto-sidebar=0' },
]

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [form, setForm] = useState({
    voornaam: '',
    achternaam: '',
    email: '',
    rol: '',
    bericht: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }))
    }
  }

  const handleSubmit = () => {
    const newErrors = {}
    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) newErrors[key] = true
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
      return
    }

    setSubmitted(true)
    setForm({ voornaam: '', achternaam: '', email: '', rol: '', bericht: '' })
    setErrors({})
  }

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setSubmitted(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [submitted])

  return (
    <section id="contact" className="contact">
      <div className="contact__inner">
        <div className="contact__left">
          <SectionHeader
            label="Contact"
            title={<>Meer weten over<br />Groene Vingers?</>}
            description="Heb je vragen over het project, het onderzoek of wil je het platform uitproberen als testgebruiker?"
            wide
          />
          <div className="contact__info-list">
            {contactItems.map((item, i) => {
              const content = (
                <>
                  <div className="contact__info-icon">
                    <img src={item.icon} alt="" />
                  </div>
                  <span className="contact__info-text">{item.text}</span>
                </>
              )
              return item.href ? (
                <a className="contact__info-item" href={item.href} key={i} {...(item.download ? { download: '' } : {})} target={item.download ? undefined : '_blank'} rel={item.download ? undefined : 'noopener noreferrer'}>
                  {content}
                </a>
              ) : (
                <div className="contact__info-item" key={i}>
                  {content}
                </div>
              )
            })}
          </div>
        </div>
        <div className="contact__right">
          {submitted ? (
            <div className="contact__confirmation">
              <img className="contact__confirmation-icon" src={plantIcon} alt="" />
              <h3 className="contact__confirmation-title">Bedankt voor je bericht!</h3>
              <p className="contact__confirmation-text">
                We hebben je bericht goed ontvangen en nemen zo snel mogelijk contact met je op.
              </p>
            </div>
          ) : (
            <>
              <div className="contact__form-row">
                <div className="contact__field">
                  <label className="contact__label">Voornaam</label>
                  <input type="text" className={`contact__input ${errors.voornaam ? 'contact__input--error' : ''}`} value={form.voornaam} onChange={handleChange('voornaam')} />
                </div>
                <div className="contact__field">
                  <label className="contact__label">Achternaam</label>
                  <input type="text" className={`contact__input ${errors.achternaam ? 'contact__input--error' : ''}`} value={form.achternaam} onChange={handleChange('achternaam')} />
                </div>
              </div>
              <div className="contact__field contact__field--full">
                <label className="contact__label">E-mailadres</label>
                <input type="email" className={`contact__input ${errors.email ? 'contact__input--error' : ''}`} value={form.email} onChange={handleChange('email')} />
              </div>
              <div className="contact__field contact__field--full">
                <label className="contact__label">Ik ben een...</label>
                <select className={`contact__input contact__select ${errors.rol ? 'contact__input--error' : ''}`} value={form.rol} onChange={handleChange('rol')}>
                  <option value="" disabled></option>
                  <option value="tuineigenaar">Tuineigenaar</option>
                  <option value="tuinzoeker">Tuinzoeker</option>
                </select>
              </div>
              <div className="contact__field contact__field--full">
                <label className="contact__label">Bericht</label>
                <textarea className={`contact__textarea ${errors.bericht ? 'contact__input--error' : ''}`} value={form.bericht} onChange={handleChange('bericht')} />
              </div>
              <Button variant="primary" fullWidth onClick={handleSubmit} className={shaking ? 'button--shake' : ''}>Verstuur een bericht</Button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
