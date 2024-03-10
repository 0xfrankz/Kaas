export function ConversationHistory({
  activeConversationId,
}: {
  activeConversationId: number;
}) {
  return (
    <div className="h-full w-72 bg-red-50">
      <h3>History</h3>
      <ul>
        <li>Conversation 1</li>
        <li>Conversation 2</li>
        <li>Conversation 3</li>
        <li>Conversation 4</li>
        <li>Conversation 5</li>
      </ul>
    </div>
  );
}
