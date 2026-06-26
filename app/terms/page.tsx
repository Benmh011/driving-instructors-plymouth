import { LegalLayout } from "@/components/legal/LegalLayout";
import { LEGAL, operatorName } from "@/lib/legal";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro="The terms that govern your use of the Driving Instructors Plymouth platform."
    >
      <p>
        These terms govern your use of the Driving Instructors Plymouth platform
        (the &ldquo;<strong>Platform</strong>&rdquo;) at
        drivinginstructorsplymouth.com, operated by {operatorName}{" "}
        (&ldquo;<strong>DIP</strong>&rdquo;, &ldquo;<strong>we</strong>&rdquo;,
        &ldquo;<strong>us</strong>&rdquo;). By using the Platform you agree to
        these terms.
      </p>

      <h2>1. Definitions</h2>
      <ul>
        <li>
          <strong>Instructor</strong> — an independent, DVSA-approved driving
          instructor (ADI) who offers tuition through the Platform.
        </li>
        <li>
          <strong>Learner</strong> — a user who books lessons with an Instructor
          through the Platform.
        </li>
        <li>
          <strong>Lesson</strong> — a driving lesson arranged between a Learner
          and an Instructor.
        </li>
        <li>
          <strong>Prepaid Hours / Credit</strong> — lesson time a Learner has paid
          an Instructor for in advance (see section 7).
        </li>
      </ul>

      <h2>2. What DIP is — and isn&rsquo;t</h2>
      <p>
        DIP is a <strong>marketplace and booking platform</strong>. We connect
        Learners with independent Instructors and provide tools to schedule,
        message and pay for lessons.
      </p>
      <p>
        <strong>
          We are not a driving school and we do not provide tuition.
        </strong>{" "}
        Each Instructor is an independent business, solely responsible for the
        lessons they deliver, their conduct, their vehicle, their insurance, and
        their compliance with DVSA requirements and the law. The contract for
        tuition is between the Learner and the Instructor, not with DIP.
      </p>

      <h2>3. Accounts and eligibility</h2>
      <p>
        You must give accurate information, keep your login secure, and be old
        enough to hold the relevant account (learners must be at least{" "}
        {LEGAL.minLearnerAge}). You&rsquo;re responsible for activity under your
        account. We offer two-factor authentication and recommend enabling it.
      </p>

      <h2>4. Instructor terms</h2>
      <p>
        If you register as an Instructor, you confirm that you hold a current DVSA
        ADI badge and the necessary insurance and licences, and you agree that:
      </p>
      <ul>
        <li>We may verify your ADI status before your profile goes live.</li>
        <li>
          You set your own prices, availability and cancellation notice period.
        </li>
        <li>
          You are responsible for your own tax, National Insurance and regulatory
          obligations as an independent business.
        </li>
        <li>
          You are the merchant of record for payments from your Learners (see
          section 6).
        </li>
        <li>
          Your use of the Platform is subject to the subscription fee shown when
          you set up your instructor account, separate from the lesson fees you
          charge Learners.
        </li>
      </ul>

      <h2>5. Learner terms</h2>
      <p>
        If you register as a Learner, you agree to book lessons in good faith, pay
        for lessons as agreed with your Instructor, attend or cancel within your
        Instructor&rsquo;s notice period, and behave lawfully and respectfully
        (see our <a href="/acceptable-use">Acceptable Use Policy</a>).
      </p>

      <h2>6. Payments</h2>
      <p>
        Payments are processed by Stripe. Lesson payments are made directly to
        your Instructor&rsquo;s connected Stripe account — DIP does not hold or
        control Learner funds, and the Instructor is the merchant of record for
        those payments. DIP charges Instructors a subscription fee for use of the
        Platform and does not charge Learners a fee for using the Platform.
      </p>

      <h2>7. Prepaid Hours / lesson credit</h2>
      <p>
        Where enabled, a Learner may pay an Instructor in advance for a block of
        lesson hours (&ldquo;<strong>Prepaid Hours</strong>&rdquo;). Prepaid
        Hours:
      </p>
      <ul>
        <li>
          are a credit toward future lessons with that specific Instructor, are
          not money held by DIP, and are not transferable to another Instructor or
          generally cashable out;
        </li>
        <li>are paid directly to the Instructor via Stripe;</li>
        <li>
          may be refunded on a pro-rata basis for unused hours, subject to the
          Instructor&rsquo;s approval, these terms, and your statutory rights;
        </li>
        <li>
          are intended to be refunded to you for any unused balance if your
          Instructor stops using the Platform or closes their account.
        </li>
      </ul>

      <h2>8. Cancellations and refunds</h2>
      <p>
        Each Instructor sets a cancellation notice period. Cancelling within that
        period may be treated as a late cancellation. Refunds on cancelled, paid
        lessons are approved by the Instructor; where a lesson was paid by Prepaid
        Hours, those hours are returned on approval. Nothing in these terms
        removes the statutory rights you have as a consumer, including under the
        Consumer Rights Act 2015 and the Consumer Contracts Regulations 2013.
      </p>

      <h2>9. Acceptable use</h2>
      <p>
        Your use of the Platform is subject to our{" "}
        <a href="/acceptable-use">Acceptable Use Policy</a>.
      </p>

      <h2>10. Disclaimers and liability</h2>
      <p>
        The Platform is provided &ldquo;as is&rdquo;. We do not guarantee any
        particular Instructor, lesson outcome, exam result, or availability.{" "}
        <strong>
          We are not responsible for the tuition itself, the conduct of
          Instructors or Learners, or the safety of lessons
        </strong>{" "}
        — those are matters between Learner and Instructor.
      </p>
      <p>
        Nothing in these terms limits liability that cannot be limited by law
        (including for death or personal injury caused by negligence, or for
        fraud). Subject to that, our total liability to you is limited to{" "}
        {LEGAL.liabilityCap}, and we are not liable for indirect or consequential
        loss.
      </p>

      <h2>11. Disputes between users</h2>
      <p>
        Disputes about a lesson are primarily between the Learner and the
        Instructor. We may, but are not obliged to, help resolve issues.
      </p>

      <h2>12. Closing your account</h2>
      <p>
        You may close your account at any time. When you do, we anonymise your
        personal data and retain financial records as set out in our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>13. Termination, governing law and changes</h2>
      <p>
        We may suspend or terminate accounts that breach these terms. These terms
        are governed by the law of England and Wales, and disputes are subject to
        the courts of England and Wales. We may update these terms; continued use
        after a change means you accept the updated terms.
      </p>

      <h2>14. Contact</h2>
      <p>
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </LegalLayout>
  );
}
