import { LegalLayout } from "@/components/legal/LegalLayout";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: "Acceptable Use Policy" };

export default function AcceptableUsePage() {
  return (
    <LegalLayout
      title="Acceptable Use Policy"
      intro="The rules for using the Driving Instructors Plymouth platform."
    >
      <p>
        This Acceptable Use Policy (&ldquo;<strong>AUP</strong>&rdquo;) sets out
        the rules for using the Platform. It forms part of, and should be read
        with, our <a href="/terms">Terms of Service</a>. Breaching it may lead to
        suspension or removal of your account.
      </p>

      <h2>1. Who this applies to</h2>
      <p>
        This AUP applies to everyone who uses the Platform — both Learners and
        Instructors.
      </p>

      <h2>2. You must not</h2>
      <ul>
        <li>Use the Platform for anything unlawful, fraudulent, or harmful.</li>
        <li>
          Harass, bully, threaten, abuse or discriminate against any other user.
        </li>
        <li>
          Impersonate anyone, or misrepresent who you are or your qualifications.
        </li>
        <li>
          Post false, misleading or fake content, including fake reviews or bogus
          instructor credentials.
        </li>
        <li>
          Misuse the messaging tools (spam, scams, unsolicited marketing, or
          sharing others&rsquo; personal information without permission).
        </li>
        <li>
          Probe, scrape, overload, hack, or otherwise interfere with the security
          or operation of the Platform.
        </li>
        <li>
          Upload anything containing malware, or that infringes someone
          else&rsquo;s rights (including intellectual property).
        </li>
      </ul>

      <h2>3. Content standards</h2>
      <p>
        Anything you post — profile details, messages, reviews, notes — must be
        honest, lawful, respectful, and not infringe anyone&rsquo;s rights. We may
        remove content that breaches these standards.
      </p>

      <h2>4. Instructors — additional rules</h2>
      <p>
        Instructors must hold a valid DVSA ADI badge and the required insurance,
        keep their vehicle roadworthy and lawful, and conduct lessons safely and
        professionally. Misrepresenting your qualifications or endangering learners
        is a serious breach.
      </p>

      <h2>5. Reporting problems</h2>
      <p>
        If you see something that breaches this AUP, report it to{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>. We take
        safety and conduct seriously and will review reports.
      </p>

      <h2>6. Enforcement</h2>
      <p>
        We may investigate suspected breaches and may warn, suspend or remove
        accounts, remove content, and where appropriate report matters to the
        relevant authorities (including the DVSA or police). We aim to act
        proportionately.
      </p>

      <h2>7. Changes and contact</h2>
      <p>
        We may update this AUP as the Platform changes. Questions:{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </LegalLayout>
  );
}
