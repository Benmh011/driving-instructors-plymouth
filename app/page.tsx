import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { TwoSided } from "@/components/TwoSided";
import { Coverage } from "@/components/Coverage";
import { Waitlist } from "@/components/Waitlist";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative z-10">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <TwoSided />
        <Coverage />
        <Faq />
        <Waitlist />
      </main>
      <Footer />
    </div>
  );
}
