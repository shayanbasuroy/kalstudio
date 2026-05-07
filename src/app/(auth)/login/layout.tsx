import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In | Kal Studio",
  description:
    "Sign in to your Kal Studio dashboard to manage projects, clients, team operations, and track business growth.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
