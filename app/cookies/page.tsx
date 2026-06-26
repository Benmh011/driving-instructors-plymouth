import { LegalLayout } from "@/components/legal/LegalLayout";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      intro="How Driving Instructors Plymouth uses cookies and similar technologies."
    >
      <p>
        This policy explains how the Platform uses cookies and similar
        technologies, and how you can manage them. It should be read with our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>1. What cookies are</h2>
      <p>
        Cookies are small text files stored on your device when you visit a
        website. &ldquo;Similar technologies&rdquo; includes browser local storage
        and service workers, which the Platform also uses to function as an
        installable app (PWA).
      </p>

      <h2>2. The cookies we use</h2>
      <p>
        We use only <strong>strictly necessary</strong> and{" "}
        <strong>functional</strong> technologies. We do not use advertising
        cookies or third-party analytics.
      </p>
      <table>
        <thead>
          <tr>
            <th>Name / type</th>
            <th>Purpose</th>
            <th>Category</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Session / authentication cookie</td>
            <td>Keeps you securely signed in</td>
            <td>Strictly necessary</td>
            <td>Session</td>
          </tr>
          <tr>
            <td>
              <code>dip_td</code> (trusted device)
            </td>
            <td>
              Remembers a device for two-factor authentication if you choose
              &ldquo;remember this device&rdquo;
            </td>
            <td>Strictly necessary</td>
            <td>Up to 30 days</td>
          </tr>
          <tr>
            <td>CSRF / security token</td>
            <td>Protects forms and sign-in against cross-site attacks</td>
            <td>Strictly necessary</td>
            <td>Session</td>
          </tr>
          <tr>
            <td>Stripe cookies</td>
            <td>
              Set by Stripe during payment to process payments and prevent fraud
            </td>
            <td>Strictly necessary (third party)</td>
            <td>Per Stripe</td>
          </tr>
          <tr>
            <td>Service worker / local storage / cache</td>
            <td>
              Lets the app load reliably, work offline, and remember in-app
              preferences (e.g. sidebar state)
            </td>
            <td>Functional</td>
            <td>Until cleared</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Do we need your consent?</h2>
      <p>
        Under the Privacy and Electronic Communications Regulations (PECR),
        strictly necessary cookies do not require consent, but you must still be
        told about them — which is the purpose of this policy. We do not currently
        use any non-essential cookies. If we later add analytics or advertising
        cookies, we will ask for your consent first through a cookie banner that
        lets you reject them as easily as accept them.
      </p>

      <h2>4. Managing cookies</h2>
      <p>
        You can control or delete cookies through your browser settings, and you
        can clear the app&rsquo;s stored data the same way. Blocking strictly
        necessary cookies may stop parts of the Platform (such as signing in) from
        working.
      </p>

      <h2>5. Changes and contact</h2>
      <p>
        We may update this policy as the Platform changes. Questions:{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </LegalLayout>
  );
}
