// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import {
  initializeWaitlistMeasurement,
  sendWaitlistSignupConversion,
  WAITLIST_GOOGLE_ADS_DESTINATION,
} from "@/app/unlimited/google-ads";

type TestWindow = Window & {
  dataLayer?: unknown[];
  azaleaWaitlistMeasurementReady?: boolean;
};

afterEach(() => {
  const target = window as TestWindow;
  delete target.gtag;
  delete target.dataLayer;
  delete target.azaleaWaitlistMeasurementReady;
});

it("initializes once with storage and personalization denied before config", () => {
  window.gtag = vi.fn();
  initializeWaitlistMeasurement();
  initializeWaitlistMeasurement();
  expect(window.gtag).toHaveBeenNthCalledWith(1, "consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  expect(window.gtag).toHaveBeenCalledTimes(3);
  expect(window.gtag).not.toHaveBeenCalledWith("event", "conversion", expect.anything());
});

it("queues a signup before the external script loads without personal data", () => {
  sendWaitlistSignupConversion();
  const commands = (window as TestWindow).dataLayer!.map((entry) =>
    Array.from(entry as IArguments),
  );
  expect(commands.at(-1)).toEqual([
    "event",
    "conversion",
    { send_to: WAITLIST_GOOGLE_ADS_DESTINATION, value: 0, currency: "USD" },
  ]);
  expect(commands.filter((entry) => entry[0] === "event")).toHaveLength(1);
  expect(JSON.stringify(commands.at(-1))).not.toMatch(/email|user_data|@/);
});
