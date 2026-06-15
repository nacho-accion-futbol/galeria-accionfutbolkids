export default async function handler(req, res) {
  try {
    const { folderId } = req.query;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;

    if (!folderId || !apiKey) {
      return res.status(400).json({ error: 'Falta folderId o API key' });
    }

    const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`;
    const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&spaces=drive&fields=files(id,name,mimeType,thumbnailLink,webContentLink)&pageSize=100&key=${apiKey}`;

    const response = await fetch(driveUrl);
    const data = await response.json();

    if (data.error) {
      console.log('Drive API error - carpeta podría ser privada:', data.error);
      return res.status(200).json([]);
    }

    const photos = (data.files || [])
      .filter((file) => file.mimeType.includes('image'))
      .map((file) => ({
        id: file.id,
        name: file.name,
        thumbnailLink: file.thumbnailLink,
        webContentLink: file.webContentLink,
      }));

    res.status(200).json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json([]);
  }
}
