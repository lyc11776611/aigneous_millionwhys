import { Metadata } from 'next';
import QuizClient from './QuizClient';
import { getCategoryEmoji } from '../lib/emoji';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  const params = await searchParams;
  const questionText = typeof params.q === 'string' ? decodeURIComponent(params.q) : null;

  if (!questionText) {
    return {
      title: 'AIgneous Million Whys - Ignite Your Curiosity',
      description: 'Discover the answers to millions of "Why" questions about our world in just 10 seconds.',
    };
  }

  // Try to guess category from text for a better title (simple heuristic or generic)
  // Since we don't have the full question object here easily without fetching, 
  // we'll rely on the text itself and our emoji helper.
  const emoji = getCategoryEmoji('', questionText);

  return {
    title: `${emoji} ${questionText} - AIgneous`,
    description: `Do you know the answer? Find out in 10 seconds on AIgneous Million Whys!`,
    openGraph: {
      title: `${emoji} ${questionText}`,
      description: `Do you know the answer? Find out in 10 seconds on AIgneous Million Whys!`,
      type: 'website',
      images: [
        {
          url: `/api/og?q=${encodeURIComponent(questionText)}`,
          width: 1200,
          height: 630,
          alt: questionText,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${emoji} ${questionText}`,
      description: `Do you know the answer? Find out in 10 seconds on AIgneous Million Whys!`,
      images: [`/api/og?q=${encodeURIComponent(questionText)}`],
    },
  };
}

export default function QuizPage() {
  return <QuizClient />;
}
