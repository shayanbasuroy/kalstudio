import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Kal Studio | Web Design & Development Careers",
  description:
    "Apply to join Kal Studio's elite team of web designers, developers, and sales professionals. Work on global projects with top-tier talent.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
