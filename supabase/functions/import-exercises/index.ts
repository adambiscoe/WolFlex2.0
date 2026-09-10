// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const WGER_BASE_URL = "https://wger.de/api/v2/exerciseinfo/?limit=100";
const ENGLISH_LANGUAGE_ID = 2;

type WgerTranslation = {
  language: number;
  name: string;
  description: string;
};

type WgerImage = {
  image: string;
  is_main: boolean;
};

type WgerExercise = {
  id: number;
  uuid: string;
  category: { name: string } | null;
  muscles: { name: string }[];
  muscles_secondary: { name: string }[];
  equipment: { name: string }[];
  translations: WgerTranslation[];
  images: WgerImage[];
};

type ExerciseRow = {
  id: number;
  uuid: string;
  name: string;
  description: string;
  category: string | null;
  muscles: string[];
  muscles_secondary: string[];
  equipment: string[];
  image_url: string | null;
};

function toRow(exercise: WgerExercise): ExerciseRow | null {
  const translation = exercise.translations.find(
    (t) => t.language === ENGLISH_LANGUAGE_ID,
  );
  // Some exercises only have translations in other languages — skip those
  // rather than storing a row with no usable name.
  if (!translation) return null;

  const mainImage =
    exercise.images.find((img) => img.is_main) ?? exercise.images[0];

  return {
    id: exercise.id,
    uuid: exercise.uuid,
    name: translation.name,
    description: translation.description,
    category: exercise.category?.name ?? null,
    muscles: exercise.muscles.map((m) => m.name),
    muscles_secondary: exercise.muscles_secondary.map((m) => m.name),
    equipment: exercise.equipment.map((e) => e.name),
    image_url: mainImage?.image ?? null,
  };
}

// This endpoint uses 'secret' access only — this is a privileged admin job
// (bulk-writes the exercises table), never something a client app should be
// able to trigger with its publishable key.
export default {
  fetch: withSupabase({ auth: ["secret"] }, async (_req, ctx) => {
    let nextUrl: string | null = WGER_BASE_URL;
    let imported = 0;
    let skipped = 0;

    while (nextUrl) {
      const response = await fetch(nextUrl);
      if (!response.ok) {
        return Response.json(
          { error: `wger request failed: ${response.status}` },
          { status: 502 },
        );
      }

      const page: { results: WgerExercise[]; next: string | null } =
        await response.json();

      const rows = page.results
        .map(toRow)
        .filter((row): row is ExerciseRow => row !== null);
      skipped += page.results.length - rows.length;

      if (rows.length > 0) {
        const { error } = await ctx.supabaseAdmin
          .from("exercises")
          .upsert(rows, { onConflict: "id" });

        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }
        imported += rows.length;
      }

      nextUrl = page.next;
    }

    return Response.json({ imported, skipped });
  }),
};

/* To invoke:

  supabase functions deploy import-exercises
  supabase functions invoke import-exercises

  (requires the project's secret key, which `invoke` sends automatically
  when run from an authenticated CLI session)
*/
