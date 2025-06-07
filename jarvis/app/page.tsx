"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useChat } from "./ChatProvider";

export default function Home() {
  const { createNewChat, threadId } = useChat();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new chat thread or existing thread if it exists
    // This will ensure that the user is always redirected to a valid chat thread
    if (threadId == null) {
      // If threadId is null, create a new chat and redirect to it
      const newId = createNewChat();
      router.replace(`/${newId}`);
      return;
    }
    // If threadId exists, redirect to that thread
    router.replace(`/${threadId}`);
  }, [createNewChat, router, threadId]);

  return null;
}
