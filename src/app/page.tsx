import { HeroSection } from "@/features/home/components/HeroSection/HeroSection";
import { FeaturesSection } from "@/features/home/components/FeaturesSection/FeaturesSection";
import { ComplianceSection } from "@/features/home/components/ComplianceSection/ComplianceSection";
import { SecuritySection } from "@/features/home/components/SecuritySection/SecuritySection";
import { PricingSection } from "@/features/home/components/PricingSection/PricingSection";
import { TestimonialsSection } from "@/features/home/components/TestimonialsSection/TestimonialsSection";
import { FinalCtaSection } from "@/features/home/components/FinalCtaSection/FinalCtaSection";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";

export default function HomePage() {
  return <><HeroSection /><main id="main-content"><FeaturesSection /><ComplianceSection /><SecuritySection /><PricingSection /><TestimonialsSection /><FinalCtaSection /></main><SiteFooter /></>;
}
