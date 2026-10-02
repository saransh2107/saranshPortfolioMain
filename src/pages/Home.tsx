import Hero from '../components/Hero'
import About from '../components/About'
import Certifications from '../components/Certifications'
import SkillsBanner from '../components/SkillsBanner'
import SalesforceQuiz from '../components/SalesforceQuiz'
import BlogPreview from '../components/BlogPreview'
import Contact from '../components/Contact'

export default function Home() {
  return (
    <>
      <Hero />
      <div className="section-divider" />
      <About />
      <div className="section-divider" />
      <Certifications />
      <div className="section-divider" />
      <SkillsBanner />
      <div className="section-divider" />
      <SalesforceQuiz />
      <div className="section-divider" />
      <BlogPreview />
      <div className="section-divider" />
      <Contact />
    </>
  )
}
