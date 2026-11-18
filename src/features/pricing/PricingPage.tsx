import { MarketingPage } from "@/components/layout/MarketingPage/MarketingPage";
import { ProductHero } from "@/components/layout/ProductHero/ProductHero";
import { PricingSection } from "@/features/home/components/PricingSection/PricingSection";
import { FinalCtaSection } from "@/features/home/components/FinalCtaSection/FinalCtaSection";
import { FaqSection } from "@/features/faq/FaqSection";
import { site } from "@/config/site";
export function PricingPage() {
  return (
    <MarketingPage tone="cyan">
      <ProductHero
        badge="Room to grow, without the guesswork"
        title="Simple pricing, built to grow with your business."
        description="Start free, and upgrade as your business — and your books — grow."
      />
      <PricingSection />
      <FaqSection pricing />
      <FinalCtaSection
        eyebrow="Still deciding?"
        title={<>Let&apos;s talk about your starting point.</>}
        actionLabel="Talk To CoreOne"
        href={site.destinations.contact}
      />
    </MarketingPage>
  );
}
