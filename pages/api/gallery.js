const colors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
];

export default async function handler(req, res) {
  try {
    const sheetId = process.env.NEXT_PUBLIC_SHEET_ID;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;

    if (!sheetId || !apiKey) {
      return res.status(500).json({ error: 'Faltan variables de entorno' });
    }

    const range = 'Hoja1!A1:B100';
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    const response = await fetch(sheetUrl);
    const sheetData = await response.json();

    if (!sheetData.values) {
      return res.status(200).json([]);
    }

    const events = [];
    for (let i = 1; i < sheetData.values.length; i++) {
      const row = sheetData.values[i];
      if (row[0] && row[1]) {
        const date = row[0].trim();
        const linkText = row[1].trim();
        
        let folderId = null;
        
        if (linkText.includes('drive.google.com')) {
          const match = linkText.match(/\/folders\/([a-zA-Z0-9-_]+)/);
          if (match) {
            folderId = match[1];
          }
        }

        events.push({
          date,
          title: linkText,
          folderId,
          url: linkText,
          gradient: colors[events.length % colors.length],
        });
      }
    }

    res.status(200).json(events);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al cargar los eventos' });
  }
}
