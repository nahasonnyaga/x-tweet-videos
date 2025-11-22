import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@lib/supabase';
import { firestore } from '@lib/firebase';
import { cloudinary } from '@lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const { fileBase64, fileName, fileType, description } = req.body;
    const videoId = uuidv4();
    const buffer = Buffer.from(fileBase64, 'base64');

    // Upload to Cloudinary
    const cloudRes = await cloudinary.uploader.upload_stream(
      { resource_type: 'video', public_id: videoId, chunk_size: 6000000 },
      async (error, result) => {
        if (error) throw error;

        const videoUrl = result?.secure_url;

        if (!videoUrl) throw new Error('Cloudinary upload failed');

        // Insert metadata into Firebase
        await firestore.collection('videos').doc(videoId).set({
          id: videoId,
          url: videoUrl,
          description,
          created_at: new Date(),
        });

        // Optional: Insert metadata into Supabase (secondary storage)
        const { error: supaError } = await supabase.from('videos').insert([
          { id: videoId, url: videoUrl, description, created_at: new Date() },
        ]);

        if (supaError) console.error('Supabase error:', supaError);

        res.status(200).json({ id: videoId, url: videoUrl });
      }
    );

    cloudRes.end(buffer);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
