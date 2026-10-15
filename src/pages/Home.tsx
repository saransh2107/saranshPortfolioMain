import Hero from '../components/Hero'
import About from '../components/About'
import Certifications from '../components/Certifications'
import Projects from '../components/Projects'
import SkillsBanner from '../components/SkillsBanner'
import SalesforceQuiz from '../components/SalesforceQuiz'
import BlogPreview from '../components/BlogPreview'
import Contact from '../components/Contact'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'

export default function Home() {
  const { hash } = useLocation()

  // Arriving from another page via /#section: scroll to it once the sections are rendered
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 50)
    return () => clearTimeout(t)
  }, [hash])

  useSeo({
    title: 'Saransh Batham — Salesforce Developer | LWC, Data Cloud',
    description: '6× certified Salesforce Developer with 4+ years in Apex, Lightning Web Components, Data Cloud & Agentforce. Creator of the SF Impact Analyzer Chrome extension.',
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
