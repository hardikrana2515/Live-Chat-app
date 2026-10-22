import React from 'react'
import LandingHeader from './LandingHeader'
import HeroSection from './HeroSection'
import PrivateMessagingSection from './PrivateMessagingSection'
import GroupMessagingSection from './GroupMessagingSection'
import VoiceVideoSection from './VoiceVideoSection'
import PrivacySection from './PrivacySection'
import FAQSection from './FAQSection'
import AboutTalkyySection from './AboutTalkyySection'
import FinalCTA from './FinalCTA'
import LandingFooter from './LandingFooter'
import useScrollSynchronizedPanels from './useScrollSynchronizedPanels'


const LandingPage = () => {
  useScrollSynchronizedPanels()

  return (
    <div className="landing-root min-h-screen overflow-x-clip">
      <LandingHeader />
      <main id="main-content">
        <HeroSection />
        <PrivateMessagingSection />
        <GroupMessagingSection />
        <VoiceVideoSection />
        <PrivacySection />
        <FAQSection />
        <AboutTalkyySection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  )
}

export default LandingPage
