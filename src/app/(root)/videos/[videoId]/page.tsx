'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@lib/supabase';

export default function VideoPage() {
  const router = useRouter();
  const { videoId } = router.query;
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;
    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('url')
        .eq('id', videoId)
        .single();
      if (error) console.error(error);
      else setVideoUrl(data.url);
    };
    fetchVideo();
  }, [videoId]);

  if (!videoUrl) return <p>Loading video...</p>;

  return (
    <div className="video-page">
      <video src={videoUrl} controls autoPlay className="w-full max-h-[80vh]" />
    </div>
  );
}
