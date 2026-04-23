import SectionHeader from '../SectionHeader/SectionHeader'
import iconChallenge from '../../assets/553303049cdc3698b8d745b544308fbda8709a15.svg'
import iconDigital from '../../assets/91f92c147b139923edc926a951d600855c3b0456.svg'
import iconLegal from '../../assets/9543494263d307aa77520ea8e897710eeadfde22.svg'
import iconValidated from '../../assets/a5bfddbd5fc5f3c974b3fbb73dce2a3aab9971c4.svg'
import './About.css'

const cards = [
  {
    icon: iconChallenge,
    title: 'Maatschappelijke uitdaging',
    description: 'Verstedelijking en de groeiende nood aan groen en sociale verbondenheid in steden.',
  },
  {
    icon: iconDigital,
    title: 'Digitale oplossing',
    description: 'Een platform dat mensen verbindt rond gedeelde groene ruimte via slimme matching.',
  },
  {
    icon: iconLegal,
    title: 'Juridische context',
    description: 'Haalbaarheid onderzocht binnen maatschappelijk en juridisch kader.',
  },
  {
    icon: iconValidated,
    title: 'Gevalideerd concept',
    description: 'Iteratieve gebruikerstesten en ontwerpoptimalisaties leiden tot een sterk eindresultaat.',
  },
]

export default function About() {
  return (
    <div className="about__row">
      <div className="about__text">
        <SectionHeader
          label="Over het project"
          title=""
          variant="brand"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-600)' }}>
          <h2 className="about__title">Ongebruikte tuinen krijgen nieuw leven</h2>
          <div className="about__description">
            <p>
              In buurten waar groene ruimte verborgen blijft, brengt Groene Vingers mensen samen. Door tuineigenaars en
              tuinzoekers op een laagdrempelige manier te verbinden, ontstaat een duurzame en wederzijdse vorm van
              gedeeld tuinieren.
            </p>
            <p>
              Onze bachelorproef onderzoekt hoe een digitaal platform kan bijdragen aan het delen van onderbenutte
              privétuinen in stedelijke context. We combineren UX-onderzoek, platformmodellering en maatschappelijke
              analyse.
            </p>
          </div>
          <div className="about__quote">
            <span className="about__quote-line" />
            <span className="about__quote-text">"Groei begint bij vertrouwen."</span>
          </div>
        </div>
      </div>
      <div className="about__cards">
        {cards.map((card, i) => (
          <div className="about__card" key={i}>
            <div className="about__card-icon">
              <img src={card.icon} alt={`Icoon: ${card.title}`} />
            </div>
            <div className="about__card-content">
              <h3 className="about__card-title">{card.title}</h3>
              <p className="about__card-description">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
