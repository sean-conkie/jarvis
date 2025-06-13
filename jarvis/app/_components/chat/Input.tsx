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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent default behavior of Enter key
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center p-4 w-full rounded-md bg-base-100 gap-2">
      <input
        type="text"
        placeholder="Type your message..."
        className="input grow"
        onChange={onChange}
        disabled={isLoading}
        value={inputValue}
        onKeyDown={handleKeyDown}
      />
      <button
        className="btn btn-primary"
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
