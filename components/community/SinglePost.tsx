"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PostCard, { type Me } from "./PostCard";
import type { PostRow } from "@/lib/community";

export default function SinglePost({
  post: initial,
  userId,
  liked: initialLiked,
  me,
}: {
  post: PostRow;
  userId: string;
  liked: boolean;
  me: Me | null;
}) {
  const router = useRouter();
  const [post, setPost] = useState(initial);
  const [liked, setLiked] = useState(initialLiked);

  return (
    <PostCard
      post={post}
      userId={userId}
      liked={liked}
      me={me}
      defaultOpen
      onLike={(_id, nowLiked, delta) => {
        setLiked(nowLiked);
        if (delta !== 0) {
          setPost((p) => ({ ...p, likes_count: Math.max(0, p.likes_count + delta) }));
        }
      }}
      onDeleted={() => {
        router.push("/dashboard/comunidad");
        router.refresh();
      }}
      onCommentsDelta={(_id, delta) =>
        setPost((p) => ({ ...p, comments_count: Math.max(0, p.comments_count + delta) }))
      }
    />
  );
}