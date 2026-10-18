import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  createPost,
  fetchProfile,
  fetchUserPosts,
  type ProfilePost,
} from "@/lib/posts";
import { useAuth } from "@/providers/auth-provider";

const COLUMNS = 3;
const TILE_GAP = 2;
const HORIZONTAL_PADDING = 16; // matches px-4 on the scroll content

export default function SocialTab() {
  const { session } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const tileSize = Math.floor(
    (width - HORIZONTAL_PADDING * 2 - TILE_GAP * (COLUMNS - 1)) / COLUMNS,
  );
  const [username, setUsername] = useState<string | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const userId = session?.user.id;

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    const [profile, userPosts] = await Promise.all([
      fetchProfile(userId),
      fetchUserPosts(userId),
    ]);
    if (profile.data) {
      setUsername(profile.data.username);
    }
    // Keep any previously loaded grid if a refetch fails.
    if (!userPosts.error) {
      setPosts(userPosts.data);
    }
    setPostsError(userPosts.error ?? profile.error);
    setIsLoadingPosts(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Error", "Photo library permission was denied.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    // Posts are square-only; reject anything the picker's crop let through.
    const { uri, width, height } = result.assets[0];
    if (Math.abs(width - height) > 1) {
      Alert.alert("Error", "Please crop the photo to a square.");
      return;
    }
    setImageUri(uri);
  };

  const handlePost = async () => {
    if (!session || !content.trim() || isPosting) return;

    setIsPosting(true);
    const { error } = await createPost(
      session.user.id,
      content.trim(),
      imageUri ?? undefined,
    );
    setIsPosting(false);

    if (error) {
      Alert.alert("Error", error);
      return;
    }

    setContent("");
    setImageUri(null);
    await loadProfile();
    Alert.alert("Posted", "Your post is now live.");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        {!isLoadingPosts && (
          <Text className="mt-4 font-wolFlex text-2xl text-black">
            {username ?? "Unknown"}
          </Text>
        )}
        <Text className="font-wolFlex text-2xl text-black">New Post</Text>

        <TextInput
          className="mt-4 min-h-[120px] rounded-lg border border-neutral-200 p-3 text-sm text-neutral-900"
          placeholder="What's on your mind?"
          placeholderTextColor="#8b8b8b"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {imageUri && (
          <View className="mt-3">
            <Image
              source={{ uri: imageUri }}
              className="aspect-square w-full rounded-lg"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setImageUri(null)}
              className="mt-2 items-center"
            >
              <Text className="text-sm text-wolf-red">Remove photo</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={handlePickImage}
          className="mt-3 items-center rounded-lg border border-wolf-red py-3"
        >
          <Text className="font-wolFlex text-sm text-wolf-red">
            {imageUri ? "Change Photo" : "Add Photo"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePost}
          disabled={!content.trim() || isPosting}
          className="mt-4 items-center rounded-lg bg-wolf-red py-3 disabled:opacity-50"
        >
          <Text className="font-wolFlex text-md text-white">
            {isPosting ? "POSTING…" : "POST"}
          </Text>
        </TouchableOpacity>

        <View className="mt-6 border-b border-neutral-100" />

        {isLoadingPosts ? (
          <ActivityIndicator className="mt-6" color="#bc1823" />
        ) : postsError && posts.length === 0 ? (
          <Text className="mt-6 text-center text-neutral-500">
            Could not load your posts. Switch tabs and come back to retry.
          </Text>
        ) : posts.length === 0 ? (
          <Text className="mt-6 text-center text-neutral-500">
            No posts yet.
          </Text>
        ) : (
          <View className="mt-3 flex-row flex-wrap" style={{ gap: TILE_GAP }}>
            {posts.map((post) => (
              <Pressable
                key={post.id}
                onPress={() =>
                  router.push({
                    pathname: "/PostDetail/[id]",
                    params: { id: post.id },
                  })
                }
                style={{ width: tileSize, height: tileSize }}
              >
                {post.image_url ? (
                  <Image
                    source={{ uri: post.image_url }}
                    style={{ width: tileSize, height: tileSize }}
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-full w-full bg-neutral-100 p-2">
                    <Text
                      className="text-xs text-neutral-800"
                      numberOfLines={4}
                    >
                      {post.content}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
