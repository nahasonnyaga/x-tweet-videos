import { supabase } from '@lib/supabase';

export async function GET(req: Request, { params }: { params: { videoId: string } }) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', params.videoId)
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
