"use client";

import { useState } from "react";

export const Input: React.FC<InputProps> = ({
  onSubmit,
  threadId,
}: InputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const message = event.target.value;
    setInputValue(message);
  };
  const handleSubmit = async () => {
    if (threadId) {
      // Handle the message submission logic here
      console.log(`Message sent to thread ${threadId}: ${inputValue}`);
      if (onSubmit) {
        try {
          setIsLoading(true); // Set loading state
          await onSubmit(inputValue, threadId);
          setInputValue(""); // Clear the input after submission
        } catch (error) {
          console.error("Error submitting message:", error);
        } finally {
          setIsLoading(false); // Reset loading state
        }
      }
    } else {
      console.error("Thread ID is not defined.");
    }
  };
  return (
    <div className="flex items-center p-4 w-full rounded-md bg-white">
      <input
        type="text"
        placeholder="Type your message..."
        className="flex-grow p-2 border rounded"
        onChange={onChange}
        disabled={isLoading}
      />
      <button
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        Send
      </button>
    </div>
  );
};
export type InputProps = {
  threadId?: string;
  onSubmit?: (message: string, threadId: string) => Promise<void>;
};
