import { site } from "./site";

export const navigation = [
  { label: "Home", href: "/#home" },
  { label: "Features", href: site.destinations.features },
  { label: "Pricing", href: site.destinations.pricing },
  { label: "FAQs", href: site.destinations.faqs },
  { label: "Blog", href: site.destinations.blog },
  { label: "About Us", href: site.destinations.about },
  { label: "Contact Us", href: site.destinations.contact },
];

export const footerNavigation = [
  {
    title: "Company",
    links: [
      { label: "About CoreOne", href: site.destinations.about },
      { label: "Blogs", href: site.destinations.blog },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: site.destinations.contact },
      { label: "FAQs", href: site.destinations.faqs },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Features", href: site.destinations.features },
      { label: "Pricing", href: site.destinations.pricing },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: site.destinations.terms },
      { label: "Privacy Policy", href: site.destinations.privacy },
    ],
  },
];
