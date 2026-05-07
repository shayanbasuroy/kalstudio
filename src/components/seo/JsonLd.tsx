export default function JsonLd() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.kalstudio.online/#website",
        url: "https://www.kalstudio.online",
        name: "Kal Studio",
        description:
          "Premium web design and development agency building custom websites, landing pages, and digital architecture for modern brands.",
        publisher: {
          "@type": "Organization",
          "@id": "https://www.kalstudio.online/#organization",
          name: "Kal Studio",
          url: "https://www.kalstudio.online",
          logo: {
            "@type": "ImageObject",
            url: "https://www.kalstudio.online/logo-icon.png",
            width: 512,
            height: 512,
          },
          sameAs: [
            "https://www.instagram.com/kalstudio",
            "https://www.twitter.com/kalstudio",
            "https://www.linkedin.com/company/kalstudio",
          ],
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-9876543210",
            contactType: "sales",
            availableLanguage: ["English", "Hindi", "Bengali"],
          },
          address: {
            "@type": "PostalAddress",
            addressLocality: "Kolkata",
            addressRegion: "West Bengal",
            addressCountry: "IN",
          },
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://www.kalstudio.online/#localbusiness",
        name: "Kal Studio",
        image: "https://www.kalstudio.online/og-image.png",
        url: "https://www.kalstudio.online",
        telephone: "+91-9876543210",
        email: "hello@kalstudio.online",
        priceRange: "₹₹₹",
        description:
          "Premium web design and development agency in Kolkata, India. We specialize in custom website design, landing pages, multi-page sites, UI/UX design, and digital architecture for businesses worldwide.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Kolkata",
          addressRegion: "West Bengal",
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 22.5726,
          longitude: 88.3639,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ],
            opens: "10:00",
            closes: "19:00",
          },
        ],
        sameAs: [
          "https://www.instagram.com/kalstudio",
          "https://www.twitter.com/kalstudio",
          "https://www.linkedin.com/company/kalstudio",
        ],
      },
      {
        "@type": "Service",
        "@id": "https://www.kalstudio.online/#service-web-design",
        name: "Web Design & Development",
        description:
          "Responsive, fast-loading websites with clean modern layouts and SEO-friendly structure. Custom web design tailored to your brand.",
        provider: {
          "@id": "https://www.kalstudio.online/#organization",
        },
      },
      {
        "@type": "Service",
        "@id": "https://www.kalstudio.online/#service-digital-architecture",
        name: "Digital Architecture",
        description:
          "Grow your online presence with engaging aesthetic layouts and robust backend integrations. Full digital ecosystem design.",
        provider: {
          "@id": "https://www.kalstudio.online/#organization",
        },
      },
      {
        "@type": "Service",
        "@id": "https://www.kalstudio.online/#service-ui-ux",
        name: "UI/UX Design",
        description:
          "User-friendly interfaces with intuitive navigation and mobile-first design. Conversion-optimized user experiences.",
        provider: {
          "@id": "https://www.kalstudio.online/#organization",
        },
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.kalstudio.online/#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "What web design services does Kal Studio offer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Kal Studio offers custom website design, landing pages, multi-page sites, UI/UX design, digital architecture, web development, and website optimization services for businesses of all sizes.",
            },
          },
          {
            "@type": "Question",
            name: "How much does a website cost from Kal Studio?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Our pricing varies based on project scope and complexity. We offer custom quotes tailored to your business needs. Contact us for a free consultation and estimate.",
            },
          },
          {
            "@type": "Question",
            name: "How long does it take to build a website?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Timelines depend on the project scope. A landing page typically takes 1-2 weeks, while a multi-page website or custom web application may take 3-8 weeks. We provide a clear timeline during consultation.",
            },
          },
          {
            "@type": "Question",
            name: "Do you build SEO-optimized websites?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, every website we build is optimized for search engines with semantic HTML, fast loading speeds, mobile responsiveness, proper metadata, and structured data.",
            },
          },
          {
            "@type": "Question",
            name: "Do you serve clients outside of India?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Kal Studio works with clients globally. We have experience serving businesses inside and outside India, delivering high-quality web design and development solutions worldwide.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteSchema),
      }}
    />
  );
}
