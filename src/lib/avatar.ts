import * as ImagePicker from "expo-image-picker";

import { supabase } from "@/lib/supabase";

/**
 * Opens the native photo picker with OS-level square cropping enabled, then
 * uploads the result to the user's folder in the `avatars` storage bucket
 * and updates their `users.image` column with the resulting public URL.
 *
 * Returns the new public URL, or null if the user cancelled or an error
 * occurred (errors are surfaced via the returned `error` field).
 */
export async function pickAndUploadAvatar(
  userId: string,
): Promise<{ url: string | null; error: string | null }> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { url: null, error: "Photo library permission was denied." };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) {
    return { url: null, error: null };
  }

  const asset = result.assets[0];
  const fileExt = asset.uri.split(".").pop()?.toLowerCase() ?? "jpeg";
  const path = `${userId}/avatar.${fileExt}`;

  const arraybuffer = await fetch(asset.uri).then((res) => res.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, arraybuffer, {
      contentType: asset.mimeType ?? `image/${fileExt}`,
      upsert: true,
    });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);
  // Storage URLs are cached aggressively by the OS image loader; append a
  // cache-busting query param so a re-uploaded avatar actually refreshes.
  const cacheBustedUrl = `${publicUrl}?updated=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("users")
    .update({ image: cacheBustedUrl })
    .eq("id", userId);

  if (updateError) {
    return { url: null, error: updateError.message };
  }

  return { url: cacheBustedUrl, error: null };
}
