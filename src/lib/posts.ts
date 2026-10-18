import { supabase } from "@/lib/supabase";

export type Post = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  users: { username: string | null; image: string | null } | null;
};

export async function fetchFeed(limit = 20): Promise<{
  posts: Post[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      content,
      image_url,
      created_at,
      user_id,
      users ( username, image )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { posts: [], error: error.message };
  }

  // Without generated Supabase database types, the query builder infers
  // this to-one embed (via posts.user_id's foreign key) as an array, even
  // though PostgREST returns a single object at runtime.
  return { posts: (data as unknown as Post[]) ?? [], error: null };
}

export async function createPost(
  userId: string,
  content: string,
  imageUri?: string,
): Promise<{ error: string | null }> {
  let imageUrl: string | null = null;

  if (imageUri) {
    const fileExt = imageUri.split(".").pop()?.toLowerCase() ?? "jpeg";
    const path = `${userId}/${Date.now()}.${fileExt}`;
    const arraybuffer = await fetch(imageUri).then((res) =>
      res.arrayBuffer(),
    );

    const { error: uploadError } = await supabase.storage
      .from("posts")
      .upload(path, arraybuffer, { contentType: `image/${fileExt}` });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("posts").getPublicUrl(path);
    imageUrl = publicUrl;
  }

  const { error } = await supabase.from("posts").insert({
    user_id: userId,
    content,
    image_url: imageUrl,
  });

  return { error: error?.message ?? null };
}

export type ProfilePost = Pick<
  Post,
  "id" | "content" | "image_url" | "created_at"
>;

export async function fetchUserPosts(
  userId: string,
  limit = 60,
): Promise<{ data: ProfilePost[]; error: string | null }> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, content, image_url, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data as ProfilePost[]) ?? [], error: null };
}

export async function fetchProfile(userId: string): Promise<{
  data: { username: string | null; image: string | null } | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("users")
    .select("username, image")
    .eq("id", userId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: data as { username: string | null; image: string | null },
    error: null,
  };
}

export async function fetchPostById(
  id: string,
): Promise<{ data: Post | null; error: string | null }> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      content,
      image_url,
      created_at,
      user_id,
      users ( username, image )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  // Same to-one embed typing caveat as fetchFeed.
  return { data: data as unknown as Post, error: null };
}
