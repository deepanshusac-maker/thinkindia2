import { getInstitutes } from "@/lib/data/institutes";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thinkindiabihar.org";

  // Static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/developer`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic routes (institutes)
  try {
    const institutes = await getInstitutes();
    if (institutes && institutes.length > 0) {
      institutes.forEach((inst) => {
        routes.push({
          url: `${baseUrl}/institute/${inst.slug}`,
          lastModified: new Date(inst.updated_at || new Date()),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      });
    }
  } catch (error) {
    console.error("Error generating sitemap dynamically:", error);
  }

  return routes;
}
