"use client";

import { useRouter } from "next/navigation";
import { useChat } from "./ChatProvider";

export default function Home() {

  const { createNewChat, threadId } = useChat();
  const router = useRouter();
  // Redirect to the new chat thread or existing thread if it exists
  // This will ensure that the user is always redirected to a valid chat thread
  // If threadId is null, create a new chat and redirect to it
  // If threadId exists, redirect to that thread
  router.push(`/${threadId ? threadId : createNewChat()}`);
  router.refresh();

  return null;
}
