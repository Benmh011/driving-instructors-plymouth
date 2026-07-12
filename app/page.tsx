import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { FreeTheory } from "@/components/FreeTheory";
import { TwoSided } from "@/components/TwoSided";
import { Coverage } from "@/components/Coverage";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <div className="relative z-10">
      <Header />
      <main>
        <Hero />
        <Reveal>
          <HowItWorks />
        </Reveal>
        <Reveal>
          <FreeTheory />
        </Reveal>
        <Reveal>
          <TwoSided />
        </Reveal>
        <Reveal>
          <Coverage />
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
