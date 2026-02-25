import { useState, useEffect } from 'react';

const FETCH_TIMEOUT_MS = 10000;

/**
 * Extracts JSON from Google's JSONP response wrapper.
 * Expected format: google.visualization.Query.setResponse({...})
 */
function parseGvizResponse(text) {
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?\s*$/);
  if (match) return JSON.parse(match[1]);
  // Fallback: try extracting the outermost JSON object
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}') + 1;
  if (jsonStart === -1 || jsonEnd <= jsonStart) {
    throw new Error('Could not parse Google Sheets response');
  }
  return JSON.parse(text.substring(jsonStart, jsonEnd));
}

const useGoogleSheets = (sheetId, tabName = 'Sheet1') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sheetId || sheetId === 'TU_GOOGLE_SHEET_ID_AQUI') {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const fetchData = async () => {
      try {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;

        const response = await fetch(url, { signal: controller.signal });
        const text = await response.text();

        const json = parseGvizResponse(text);

        if (!json.table || !json.table.rows || !json.table.cols) {
          throw new Error('Invalid Google Sheets data structure');
        }

        const rows = json.table.rows;
        const cols = json.table.cols;

        // Get headers from first row if cols don't have labels
        let headers = cols.map(col => (col.label || '').toLowerCase().trim());

        // If headers are empty, use the first row as headers
        if (headers.every(h => h === '')) {
          if (rows.length > 0) {
            headers = rows[0].c.map(cell => (cell?.v || '').toLowerCase().trim());
            rows.shift();
          }
        }

        // Convert to sections format
        const sectionsMap = {};

        rows.forEach((row) => {
          if (!row.c) return;

          const item = {};
          headers.forEach((header, index) => {
            if (header && row.c[index]) {
              item[header] = row.c[index]?.v || '';
            }
          });

          const sectionId = item.section;
          if (!sectionId) return;

          if (!sectionsMap[sectionId]) {
            sectionsMap[sectionId] = {
              id: sectionId,
              title: item.sectiontitle || sectionId,
              icon: item.sectionicon || '📁',
              items: []
            };
          }

          if (item.title) {
            sectionsMap[sectionId].items.push({
              title: item.title,
              link: item.link || '#',
              icon: item.icon || '🔗',
              type: item.type || 'link',
              parent: item.parent || '' // Nueva columna para sublinks
            });
          }
        });

        setData(Object.values(sectionsMap));
        setLoading(false);
      } catch (err) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Please check your connection and try again');
        } else {
          console.error('Error fetching Google Sheets:', err);
          setError(err.message);
        }
        setLoading(false);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    fetchData();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [sheetId, tabName]);

  return { data, loading, error };
};

export default useGoogleSheets;
