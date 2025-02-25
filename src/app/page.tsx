import { Chat } from '@/components/chat';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { getSuggestedQuestions } = await import('@/app/actions/suggested-questions');
  const questions = await getSuggestedQuestions();

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
      {/* Header */}
      <header>
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold">Grants Chat</h1>
        </div>
      </header>

      <Chat initialQuestions={questions} />
    </div>
  );
}