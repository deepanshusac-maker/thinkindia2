import { getInstituteBySlug, getContentByType } from "@/lib/data/institutes";
import { notFound } from "next/navigation";
import InstituteClient from "./InstituteClient";

export const revalidate = 0;

const slugToNameMap = {
  "nit-patna": "NIT Patna",
  "iit-patna": "IIT Patna",
  "iim-bodhgaya": "IIM Bodhgaya",
  "cnlu-patna": "CNLU Patna",
  "iiit-bhagalpur": "IIIT Bhagalpur",
  "nift-patna": "NIFT Patna"
};

// Generates dynamic metadata for SEO compliance
export async function generateMetadata({ params }) {
  const { slug } = await params;
  let institute = null;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      institute = await getInstituteBySlug(slug);
    }
  } catch (error) {
    // Database query failed, handle gracefully
  }

  if (!institute) {
    const name = slugToNameMap[slug] || "Think India Institute";
    return {
      title: `${name} — Think India Bihar`,
      description: `Explore the Think India Institute at ${name}, driving policy research and civic engagement.`
    };
  }

  return {
    title: `${institute.name} — Think India Bihar`,
    description: institute.about_text || `Explore the Think India Institute at ${institute.name}`
  };
}

export default async function InstitutePage({ params }) {
  const { slug } = await params;

  let institute = null;
  let team = [];
  let events = [];
  let gallery = [];
  let isFallback = false;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      institute = await getInstituteBySlug(slug);
      
      // Fetch contents from database
      const [dbTeam, dbEvents, dbGallery] = await Promise.all([
        getContentByType(institute.id, "team"),
        getContentByType(institute.id, "event"),
        getContentByType(institute.id, "gallery"),
      ]);

      team = dbTeam || [];
      events = dbEvents || [];
      gallery = dbGallery || [];
    } else {
      isFallback = true;
    }
  } catch (error) {
    console.error(
      "Failed to load live data for slug:",
      slug,
      error?.message || error?.details || (typeof error === "object" ? JSON.stringify(error) : error)
    );
    isFallback = true;
  }

  // Gracefully fallback to high quality mock data if database is empty/unconfigured
  if (isFallback || !institute) {
    const name = slugToNameMap[slug];
    if (!name) {
      notFound(); // Unrecognized slug path
    }

    institute = {
      id: `${slug}-uuid`,
      name: name,
      slug: slug,
      about_text: `Think India Institute at ${name} is dedicated to promoting legal literacy, analyzing public policies, and nurturing leadership capabilities among the youth of Bihar.`
    };

    team = [
      {
        id: `${slug}-t1`,
        title: "Aarav Mishra",
        description: "Institute President",
        image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
      },
      {
        id: `${slug}-t2`,
        title: "Ishita Roy",
        description: "Vice President",
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"
      },
      {
        id: `${slug}-t3`,
        title: "Kabir Singh",
        description: "General Secretary",
        image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop"
      },
      {
        id: `${slug}-t4`,
        title: "Meera Nair",
        description: "Treasurer & Outreach Lead",
        image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop"
      }
    ];

    events = [
      {
        id: `${slug}-e1`,
        title: "Policy Drafting Workshop 2026",
        metadata: {
          date: "2026-06-20",
          isUpcoming: true,
          description: `A hands-on workshop guiding students of ${name} through legislative policy making and bill analysis.`
        }
      },
      {
        id: `${slug}-e2`,
        title: "Constitutional Law Quiz",
        metadata: {
          date: "2026-04-14",
          isUpcoming: false,
          description: "Ambedkar Jayanti quiz competition focused on constitutional history and landmark supreme court rulings."
        }
      },
      {
        id: `${slug}-e3`,
        title: "Civic Outreach Seminar",
        metadata: {
          date: "2026-02-15",
          isUpcoming: false,
          description: "Legal literacy camp for rural sectors highlighting consumer rights and public grievance portals."
        }
      }
    ];

    gallery = [
      {
        id: `${slug}-g1`,
        title: "Inaugural Ceremony Session",
        image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: `${slug}-g2`,
        title: "Team Seminar Panelists",
        image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: `${slug}-g3`,
        title: "National Debate Championship",
        image_url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: `${slug}-g4`,
        title: "Institute Interactive Session",
        image_url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800&auto=format&fit=crop"
      }
    ];

    isFallback = true;
  }

  return (
    <InstituteClient
      institute={institute}
      team={team}
      events={events}
      gallery={gallery}
      usingMockData={isFallback}
    />
  );
}
