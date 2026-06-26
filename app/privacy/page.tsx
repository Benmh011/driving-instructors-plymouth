import { LegalLayout } from "@/components/legal/LegalLayout";
import { LEGAL, operatorName } from "@/lib/legal";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="How Driving Instructors Plymouth collects, uses and protects your personal data."
    >
      <h2>1. Who we are</h2>
      <p>
        Driving Instructors Plymouth (&ldquo;<strong>DIP</strong>&rdquo;,
        &ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;)
        operates the website and app at drivinginstructorsplymouth.com (the
        &ldquo;<strong>Platform</strong>&rdquo;), which connects learner drivers
        with independent, DVSA-approved driving instructors
        (&ldquo;<strong>ADIs</strong>&rdquo;) in Plymouth and South West Devon.
      </p>
      <p>
        For the purposes of UK data protection law (the UK GDPR and the Data
        Protection Act 2018), the data controller is:
      </p>
      <ul>
        <li>
          <strong>Operator:</strong> {operatorName}
        </li>
        {LEGAL.registeredAddress && (
          <li>
            <strong>Registered address:</strong> {LEGAL.registeredAddress}
          </li>
        )}
        {LEGAL.companyNumber && (
          <li>
            <strong>Company number:</strong> {LEGAL.companyNumber}
          </li>
        )}
        {LEGAL.icoNumber && (
          <li>
            <strong>ICO registration number:</strong> {LEGAL.icoNumber}
          </li>
        )}
        <li>
          <strong>Contact:</strong>{" "}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
        </li>
      </ul>
      <p>
        DIP and the instructors on the Platform are each independent controllers
        of the personal data they hold. This notice covers how DIP uses your
        data.
      </p>

      <h2>2. The personal data we collect</h2>
      <p>
        <strong>Account data (all users):</strong> name, email address, hashed
        password, account role (learner or instructor), and two-factor
        authentication settings.
      </p>
      <p>
        <strong>Learner data:</strong> your area or postcode, preferred
        transmission (manual / automatic), learning goal (optional), your chosen
        instructor, lesson bookings and history, prepaid lesson credit and
        transaction records, and messages you send to your instructor through the
        Platform.
      </p>
      <p>
        <strong>Instructor data:</strong> your ADI badge number, business name,
        the areas you cover, hourly rate, tuition car details, a short bio,
        profile photo and ADI badge image, your roster of learners, lesson and
        earnings records, and your connected payment account details (held by
        Stripe).
      </p>
      <p>
        <strong>Payment data:</strong> card payments and payouts are processed by
        Stripe. We do not see or store full card numbers. We hold records about
        transactions (amounts, dates, status, Stripe references) needed to run
        lessons and meet our accounting obligations.
      </p>
      <p>
        <strong>Technical data:</strong> device push-notification tokens (if you
        enable notifications), a trusted-device token (if you choose &ldquo;remember
        this device&rdquo;), cookies and similar technologies (see our Cookie
        Policy), and basic logs.
      </p>

      <h2>3. How we collect it</h2>
      <p>
        We collect data directly from you (when you register, build your profile,
        book or pay for lessons, or message another user), automatically (cookies
        and technical data when you use the Platform), and from Stripe (which
        confirms payment and payout status to us).
      </p>

      <h2>4. Why we use it, and our lawful bases</h2>
      <table>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Lawful basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Create and run your account; connect learners and instructors; book
              and run lessons
            </td>
            <td>Performance of a contract</td>
          </tr>
          <tr>
            <td>Process payments and prepaid credit; issue refunds</td>
            <td>Performance of a contract</td>
          </tr>
          <tr>
            <td>Keep financial and transaction records</td>
            <td>Legal obligation (tax/accounting)</td>
          </tr>
          <tr>
            <td>
              Send service emails and (if enabled) push notifications about your
              lessons
            </td>
            <td>Performance of a contract / legitimate interests</td>
          </tr>
          <tr>
            <td>Verify instructors are DVSA-approved</td>
            <td>Legitimate interests (learner safety, trust)</td>
          </tr>
          <tr>
            <td>Secure the Platform, prevent fraud and abuse</td>
            <td>Legitimate interests</td>
          </tr>
          <tr>
            <td>Optional marketing communications, if any</td>
            <td>Consent</td>
          </tr>
        </tbody>
      </table>

      <h2>5. Sharing your data</h2>
      <p>We share data only as needed to run the Platform:</p>
      <ul>
        <li>
          <strong>Between users</strong> — instructors and their learners can see
          the information needed to arrange lessons (e.g. name, area, lesson
          details, messages, tuition car). Your email and password are never
          shown to other users.
        </li>
        <li>
          <strong>Service providers</strong> acting on our instructions under
          written data-processing terms: Stripe (payments and payouts), Resend
          (transactional email), Neon (database hosting), Vercel (application
          hosting), and your browser/OS push service (to deliver notifications you
          opt into).
        </li>
        <li>
          <strong>Authorities or advisers</strong> — where required by law, or to
          establish, exercise or defend legal claims.
        </li>
      </ul>
      <p>
        We do <strong>not</strong> sell your personal data.
      </p>

      <h2>6. International transfers</h2>
      <p>
        Some providers (e.g. Stripe, Vercel, Neon) may process data outside the
        UK, including in the United States. Where they do, transfers are protected
        by appropriate safeguards such as the UK International Data Transfer
        Addendum to the EU Standard Contractual Clauses.
      </p>

      <h2>7. How long we keep it</h2>
      <p>
        We keep personal data only as long as needed for the purposes above. When
        you close your account, we anonymise your personal details — your name,
        email and profile information are scrubbed and the account can no longer
        be accessed — but retain transaction and financial records for as long as
        the law requires, generally around six years for tax and accounting
        purposes.
      </p>

      <h2>8. Your rights</h2>
      <p>
        Under UK data protection law you have the right to: access your data; have
        inaccurate data corrected; have data erased in some circumstances;
        restrict or object to processing; data portability; and to withdraw
        consent at any time where we rely on it. To exercise any right, contact{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>. You
        also have the right to complain to the Information Commissioner&rsquo;s
        Office (ICO) at ico.org.uk, though we&rsquo;d ask you to raise it with us
        first.
      </p>

      <h2>9. Children</h2>
      <p>
        Learner drivers are typically 17 or older. The Platform is not intended
        for children under {LEGAL.minLearnerAge}. Where a learner is under 18,
        additional care applies and we may require appropriate consent.
      </p>

      <h2>10. Security</h2>
      <p>
        We protect your data with measures including encryption in transit, hashed
        passwords, optional two-factor authentication, and access controls. No
        system is completely secure, but we work to protect your information and
        will notify you and the ICO of a qualifying breach as required by law.
      </p>

      <h2>11. Cookies</h2>
      <p>
        We use cookies and similar technologies as described in our{" "}
        <a href="/cookies">Cookie Policy</a>.
      </p>

      <h2>12. Changes and contact</h2>
      <p>
        We may update this policy; the &ldquo;last updated&rdquo; date shows the
        latest version. Questions or requests:{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </LegalLayout>
  );
}
