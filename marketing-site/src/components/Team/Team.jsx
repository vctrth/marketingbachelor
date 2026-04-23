import SectionHeader from '../SectionHeader/SectionHeader'
import photoArno from '../../assets/5268695094ed7bc20eac210bd6af6feec43ec8ef.webp'
import photoArthur from '../../assets/95d83a92d89021a3479eee7098d89583744f3624.webp'
import photoVictor from '../../assets/a69c3c323139704f74efdb0c7d297d1416af6b00.webp'
import './Team.css'

const members = [
  {
    name: 'Arno Van Abbenyen',
    role: 'UX/UI Design & research',
    bio: 'Zet gebruikersinzichten om in intuïtieve interfaces, duidelijke flows en betekenisvolle ervaringen',
    photo: photoArno,
  },
  {
    name: 'Arthur De Klerck',
    role: 'UX/UI Design & marketing',
    bio: 'Verbindt gebruiksvriendelijk design met marketing om sterke en herkenbare digitale ervaringen te creëren',
    photo: photoArthur,
  },
  {
    name: 'Victor Thys',
    role: 'UX/UI Testing & Full-stack Development',
    bio: 'Test en ontwikkelt digitale producten om stabiele, gebruiksvriendelijke ervaringen te garanderen.',
    photo: photoVictor,
  },
]

export default function Team() {
  return (
    <section className="team" id="over-ons">
      <div className="team__inner">
        <SectionHeader
          label="Het team"
          title="De mensen achter groene vingers"
          description="Een gepassioneerd team van studenten Digital Experience Design aan Thomas More Hogeschool."
          wide
        />
        <div className="team__cards">
          {members.map((member, i) => (
            <div className="team__card" key={i}>
              <div className="team__card-header">
                <h3 className="team__card-name">{member.name}</h3>
                <p className="team__card-role">{member.role}</p>
              </div>
              <div className="team__card-bottom">
                <p className="team__card-bio">{member.bio}</p>
                <div className="team__card-photo">
                  <img src={member.photo} alt={`Portret van ${member.name}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
