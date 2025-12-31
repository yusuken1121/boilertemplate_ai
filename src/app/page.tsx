import { ChatInterface } from "./_components/chat-interface";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 p-4 md:p-8">
      <ChatInterface />
    </main>
  );
}
