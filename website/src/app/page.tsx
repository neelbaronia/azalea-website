"use client";

import { useState } from "react";
import ConsumerView from "@/components/ConsumerView";
import PublisherView from "@/components/PublisherView";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"listen" | "create">("listen");

  return (
    <main className="relative min-h-screen">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "listen" ? (
        <ConsumerView key="listen" />
      ) : (
        <PublisherView key="create" />
      )}
    </main>
  );
}
