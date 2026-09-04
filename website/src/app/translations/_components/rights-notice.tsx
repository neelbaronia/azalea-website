import { LockKeyhole } from "lucide-react";

export function RightsNotice() {
  return (
    <aside className="rights-notice" aria-label="Private sample and rights notice">
      <LockKeyhole aria-hidden="true" />
      <strong>Private samples</strong>
      <p>
        Azalea does not own or claim copyright in the original works, which remain the property of their authors and other applicable rights holders. These non-public samples are shared solely to demonstrate the work of our translators and Azalea&apos;s editorial output. Please do not reproduce, distribute, publish, or use them commercially.
      </p>
    </aside>
  );
}
