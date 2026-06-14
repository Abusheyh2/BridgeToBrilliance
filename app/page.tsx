import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import About from '@/components/landing/About'
import Features from '@/components/landing/Features'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Footer />
    </main>
  )
}
