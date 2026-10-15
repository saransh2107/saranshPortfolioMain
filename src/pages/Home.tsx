import Hero from '../components/Hero'
import About from '../components/About'
import Certifications from '../components/Certifications'
import Projects from '../components/Projects'
import SkillsBanner from '../components/SkillsBanner'
import SalesforceQuiz from '../components/SalesforceQuiz'
import BlogPreview from '../components/BlogPreview'
import Contact from '../components/Contact'
import { useSeo } from '../hooks/useSeo'

export default function Home() {
  useSeo({
    title: 'Saransh Batham — Salesforce Developer | Apex, LWC, Agentforce, Data Cloud',
    description: 'Saransh Batham is a 6× certified Salesforce Developer from India with 4+ years building enterprise solutions in Apex, Lightning Web Components, Flow, Data Cloud and Agentforce. Creator of the SF Impact Analyzer Chrome extension.',
    path: '/',
    type: 'profile',
  })

  return (
    <>
      <Hero />
      <div className="section-divider" />
      <About />
      <div className="section-divider" />
      <Certifications />
      <div className="section-divider" />
      <Projects />
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
