import { getInstitutes, getGlobalContent } from "@/lib/data/institutes";
import HomeClient from "./HomeClient";

// Force dynamic rendering to fetch fresh database content
export const revalidate = 0;

export default async function HomePage() {
  let institutes = [];
  let events = [];
  let gallery = [];
  let isFallback = false;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // Parallel fetches for performance optimization
      const [dbInstitutes, dbEvents, dbGallery] = await Promise.all([
        getInstitutes(),
        getGlobalContent("event"),
        getGlobalContent("gallery"),
      ]);

      institutes = dbInstitutes || [];
      events = dbEvents || [];
      gallery = dbGallery || [];
    } else {
      isFallback = true;
    }
  } catch (error) {
    console.error(
      "Failed to fetch live homepage data from Supabase:",
      error?.message || error?.details || (typeof error === "object" ? JSON.stringify(error) : error)
    );
    isFallback = true;
  }

  // Graceful fallback to seed-like mock data if the database is unconfigured/empty
  if (isFallback || !institutes || institutes.length === 0) {
    institutes = [
      {
        id: "nit-patna-uuid",
        name: "NIT Patna",
        slug: "nit-patna",
        about_text: "Think India Institute at National Institute of Technology Patna, fostering legal awareness and civic engagement among engineering students."
      },
      {
        id: "iit-patna-uuid",
        name: "IIT Patna",
        slug: "iit-patna",
        about_text: "Think India Institute at Indian Institute of Technology Patna, driving policy research and constitutional governance initiatives."
      },
      {
        id: "iim-bodhgaya-uuid",
        name: "IIM Bodhgaya",
        slug: "iim-bodhgaya",
        about_text: "Think India Institute at Indian Institute of Management Bodhgaya, blending management perspectives with nation-building ideals."
      },
      {
        id: "cnlu-patna-uuid",
        name: "CNLU Patna",
        slug: "cnlu-patna",
        about_text: "Think India Institute at Chanakya National Law University Patna, empowering law students through legal research and reform advocacy."
      },
      {
        id: "iiit-bhagalpur-uuid",
        name: "IIIT Bhagalpur",
        slug: "iiit-bhagalpur",
        about_text: "Think India Institute at Indian Institute of Information Technology Bhagalpur, bridging technology and public policy."
      },
      {
        id: "nift-patna-uuid",
        name: "NIFT Patna",
        slug: "nift-patna",
        about_text: "Think India Institute at National Institute of Fashion Technology Patna, integrating creative industries with civic responsibility."
      }
    ];

    events = [
      {
        id: "me-1",
        title: "National Policy Conclave 2026",
        metadata: {
          date: "2026-07-10",
          isUpcoming: true,
          description: "A premier gathering of policy enthusiasts to discuss rural development initiatives in Bihar."
        },
        institutes: { name: "IIM Bodhgaya", slug: "iim-bodhgaya" }
      },
      {
        id: "me-2",
        title: "National Youth Parliament 2026",
        metadata: {
          date: "2026-06-15",
          isUpcoming: true,
          description: "Annual student debate simulating the Indian parliamentary process."
        },
        institutes: { name: "NIT Patna", slug: "nit-patna" }
      },
      {
        id: "me-3",
        title: "Workshop on Constitutional Law",
        metadata: {
          date: "2026-05-02",
          isUpcoming: false,
          description: "A highly informative session on constitutional rights and public interest litigation."
        },
        institutes: { name: "CNLU Patna", slug: "cnlu-patna" }
      }
    ];

    gallery = [
      {
        id: "mg-1",
        title: "IPR Seminar Panel",
        image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop",
        institutes: { name: "NIT Patna", slug: "nit-patna" }
      },
      {
        id: "mg-2",
        title: "Volunteers Group Photo",
        image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop",
        institutes: { name: "IIT Patna", slug: "iit-patna" }
      },
      {
        id: "mg-3",
        title: "National Debate Championship",
        image_url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop",
        institutes: { name: "CNLU Patna", slug: "cnlu-patna" }
      },
      {
        id: "mg-4",
        title: "Interactive Workshop Session",
        image_url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800&auto=format&fit=crop",
        institutes: { name: "IIM Bodhgaya", slug: "iim-bodhgaya" }
      }
    ];

    isFallback = true;
  }

  return (
    <HomeClient
      institutes={institutes}
      events={events}
      gallery={gallery}
      usingMockData={isFallback}
    />
  );
}
