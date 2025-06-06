import ChatContainer from "../_components/chat/ChatContainer";

const ChatPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <ChatContainer>
      <ChatContainer.Stream>
        {/* The Stream component can be used to display messages or chat history */}
      </ChatContainer.Stream>
      <ChatContainer.Input />
    </ChatContainer>
  );
};

export default ChatPage;
