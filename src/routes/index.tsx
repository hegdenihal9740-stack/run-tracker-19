import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

const CampuslyApp = lazy(() => import("../campusly/App.jsx"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Skill AI | Student Portal" },
      {
        name: "description",
        content:
          "Your Skill AI student portal for modules, subjects, attendance, marks and module-wise fees.",
      },
      { property: "og:title", content: "Skill AI | Student Portal" },
      {
        property: "og:description",
        content:
          "Your Skill AI student portal for modules, subjects, attendance, marks and module-wise fees.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <CampuslyApp />
    </Suspense>
  );
}
