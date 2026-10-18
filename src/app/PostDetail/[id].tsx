import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchPostById, type Post } from "@/lib/posts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PostDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPost = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await fetchPostById(id);
      if (cancelled) return;
      setPost(data);
      setError(fetchError);
      setIsLoading(false);
    };

    loadPost();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-1"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={26} color="#000000" />
        </TouchableOpacity>
        <Text className="ml-2 font-wolFlex text-xl text-black">Post</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-8" color="#bc1823" />
      ) : error ? (
        <Text className="mt-8 px-4 text-center text-sm text-wolf-red">
          {error}
        </Text>
      ) : !post ? (
        <Text className="mt-8 text-center text-neutral-500">
          Post not found.
        </Text>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center gap-2">
            {post.users?.image ? (
              <Image
                source={{ uri: post.users.image }}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <View className="h-10 w-10 rounded-full bg-neutral-200" />
            )}
            <View className="flex-1">
              <Text className="font-wolFlex text-lg text-black">
                {post.users?.username ?? "Unknown"}
              </Text>
              <Text className="text-xs text-neutral-400">
                {formatDate(post.created_at)}
              </Text>
            </View>
          </View>

          {post.image_url && (
            <Image
              source={{ uri: post.image_url }}
              className="mt-4 w-full rounded-lg bg-neutral-100"
              style={{ aspectRatio: 1 }}
              resizeMode="cover"
            />
          )}

          <Text className="mt-4 text-base text-neutral-800">
            {post.content}
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
