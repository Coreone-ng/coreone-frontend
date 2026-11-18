import { MarketingPage } from "@/components/layout/MarketingPage/MarketingPage";
import { FinalCtaSection } from "@/features/home/components/FinalCtaSection/FinalCtaSection";
import { site } from "@/config/site";
import { FaqContent } from "./FaqContent";
export function FaqPage() {
  return (
    <MarketingPage tone="cyan">
      <FaqContent />
      <FinalCtaSection
        eyebrow="Still deciding?"
        title={<>Let&apos;s talk about your starting point.</>}
        actionLabel="Talk To CoreOne"
        href={site.destinations.contact}
      />
    </MarketingPage>
  );
}
