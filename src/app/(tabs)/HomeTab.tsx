import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchFeed, type Post } from "@/lib/posts";

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function HomeTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      setIsLoading(true);
      const { posts: data, error } = await fetchFeed();
      setIsLoading(false);

      if (error) {
        console.error(error);
        return;
      }
      setPosts(data);
    };

    loadFeed();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      {isLoading ? (
        <ActivityIndicator className="mt-8" color="#bc1823" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-4 px-4 py-4"
          ListEmptyComponent={
            <Text className="mt-8 text-center text-neutral-500">
              No posts yet.
            </Text>
          }
          renderItem={({ item }) => (
            <View className="border-b border-neutral-100 pb-4">
              <View className="flex-row items-center gap-2">
                {item.users?.image ? (
                  <Image
                    source={{ uri: item.users.image }}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <View className="h-8 w-8 rounded-full bg-neutral-200" />
                )}
                <Text className="font-wolFlex text-sm text-black">
                  {item.users?.username ?? "Unknown"}
                </Text>
                <Text className="text-xs text-neutral-400">
                  {formatRelativeTime(item.created_at)}
                </Text>
              </View>

              <Text className="mt-2 text-sm text-neutral-800">
                {item.content}
              </Text>

              {item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  className="mt-2 aspect-square w-full rounded-lg"
                  resizeMode="cover"
                />
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
