import type { ReactNode } from "react";
import GoogleAdsWaitlistTag from "./GoogleAdsWaitlistTag";

export default function UnlimitedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GoogleAdsWaitlistTag />
      {children}
    </>
  );
}
