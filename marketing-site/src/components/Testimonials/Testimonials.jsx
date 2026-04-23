import { useState, useRef } from 'react'
import SectionHeader from '../SectionHeader/SectionHeader'
import avatarSarah from '../../assets/7746956e0d42a817b84f466a878904387dcbd54d.webp'
import avatarJohan from '../../assets/7fc96caa1a5aa21d4fb5b27dacefd7c18359c84f.webp'
import avatarLukas from '../../assets/8104644014ba87b524b93620d03688726e079f91.webp'
import './Testimonials.css'

const testimonials = [
  {
    quote:
      '"Eindelijk een platform dat aanvoelt alsof het écht voor mensen gemaakt is. De matching werkte verrassend goed, binnen de week had ik contact met een tuineigenaar op 5 minuten fietsen."',
    name: 'Sarah V.',
    role: 'Tuinzoeker, testgebruiker',
    avatar: avatarSarah,
  },
  {
    quote:
      '"Mijn tuin stond al drie jaar grotendeels leeg. Nu deel ik hem met een jong gezin en dat geeft me echt voldoening. Het platform maakt het makkelijk én veilig."',
    name: 'Johan P.',
    role: 'Tuineigenaar, testgebruiker',
    avatar: avatarJohan,
  },
  {
    quote:
      '"De interface is intuïtief en goed doordacht. De visuele hiërarchie is duidelijk en het platform heeft een warme, uitnodigende sfeer die perfect past bij het concept."',
    name: 'Lukas D.',
    role: 'UX Tester',
    avatar: avatarLukas,
  },
]

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef(null)

  const handleDotClick = (index) => {
    setActiveIndex(index)
    if (scrollRef.current) {
      const card = scrollRef.current.children[index]
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
      }
    }
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, children } = scrollRef.current
      const cardWidth = children[0]?.offsetWidth + 24
      const index = Math.round(scrollLeft / cardWidth)
      setActiveIndex(Math.min(index, testimonials.length - 1))
    }
  }

  return (
    <section className="testimonials">
      <div className="testimonials__inner">
        <SectionHeader
          label="Gebruikerservaringen"
          title="Wat zeggen onze testers?"
          description="Feedback van deelnemers aan onze gebruikerstesten."
        />
        <div
          className="testimonials__cards"
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {testimonials.map((t, i) => (
            <div className="testimonials__card" key={i}>
              <p className="testimonials__card-quote">{t.quote}</p>
              <div className="testimonials__card-author">
                <div className="testimonials__card-avatar">
                  <img src={t.avatar} alt={`Profielfoto van ${t.name}`} />
                </div>
                <div className="testimonials__card-info">
                  <span className="testimonials__card-name">{t.name}</span>
                  <span className="testimonials__card-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="testimonials__dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`testimonials__dot ${i === activeIndex ? 'testimonials__dot--active' : ''}`}
              onClick={() => handleDotClick(i)}
              aria-label={`Ga naar testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
