import { useState, useEffect, useCallback, useRef } from 'react';

const FETCH_TIMEOUT_MS = 10000;

/**
 * Extracts JSON from Google's JSONP response wrapper.
 */
function parseGvizResponse(text) {
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?\s*$/);
  if (match) return JSON.parse(match[1]);
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}') + 1;
  if (jsonStart === -1 || jsonEnd <= jsonStart) {
    throw new Error('Could not parse Google Sheets response');
  }
  return JSON.parse(text.substring(jsonStart, jsonEnd));
}

/**
 * Hook to manage Key Players from Google Form responses
 *
 * Reads data from Google Sheets (Form Responses).
 * The form responses tab typically has columns: Timestamp, Name, Role, Stack, Notes
 */
const useKeyPlayers = (sheetId, tabName = 'Form Responses 1') => {
  const [keyPlayers, setKeyPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchKeyPlayers = useCallback(async () => {
    if (!sheetId || sheetId === 'TU_GOOGLE_SHEET_ID_AQUI') {
      setLoading(false);
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      setLoading(true);

      const tabsToTry = [tabName, 'Form Responses 1', 'Respuestas de formulario 1', 'keyplayers'];

      let players = [];
      let success = false;

      for (const tab of tabsToTry) {
        if (controller.signal.aborted) break;

        try {
          const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tab)}`;
          const response = await fetch(url, { signal: controller.signal });
          const text = await response.text();

          const json = parseGvizResponse(text);

          if (!json.table || !json.table.rows || json.table.rows.length === 0) {
            continue;
          }

          // Get column headers
          const headers = json.table.cols.map(col => {
            const label = col.label?.toLowerCase().replace(/\s+/g, '') || '';
            return label;
          });

          // Map common variations of column names
          const columnMap = {
            name: ['name', 'nombre', 'fullname', 'nombrecompleto'],
            role: ['role', 'rol', 'position', 'posición', 'puesto'],
            stack: ['stack', 'technologies', 'tecnologías', 'tech'],
            notes: ['notes', 'notas', 'additionalnotes', 'notasadicionales', 'comments', 'comentarios'],
            timestamp: ['timestamp', 'marcatemporal', 'fecha'],
            cvLink: ['cvlink', 'cv', 'cvurl', 'cvdoc', 'resume', 'resumelink', 'cvlinkgoogledocurl'],
            skillsSummary: ['iasummary', 'ia', 'skillssummary', 'skills', 'summary', 'aiskills', 'technicalskills', 'extractedskills']
          };

          // Find the index for each column
          const findColumnIndex = (colNames) => {
            for (const name of colNames) {
              const idx = headers.findIndex(h => h.includes(name));
              if (idx >= 0) return idx;
            }
            return -1;
          };

          const nameIdx = findColumnIndex(columnMap.name);
          const roleIdx = findColumnIndex(columnMap.role);
          const stackIdx = findColumnIndex(columnMap.stack);
          const notesIdx = findColumnIndex(columnMap.notes);
          const timestampIdx = findColumnIndex(columnMap.timestamp);
          const cvLinkIdx = findColumnIndex(columnMap.cvLink);
          const skillsSummaryIdx = findColumnIndex(columnMap.skillsSummary);

          // Parse rows
          players = json.table.rows
            .filter(row => row.c && row.c.some(cell => cell?.v))
            .map((row, index) => {
              const getValue = (colIndex) => {
                if (colIndex < 0 || !row.c[colIndex]) return '';
                return row.c[colIndex].v || '';
              };

              const name = getValue(nameIdx);
              if (!name) return null;

              return {
                id: `form-${index}-${Date.now()}`,
                name: name,
                role: getValue(roleIdx),
                stack: getValue(stackIdx),
                notes: getValue(notesIdx),
                timestamp: getValue(timestampIdx) || new Date().toISOString(),
                cvLink: getValue(cvLinkIdx),
                skillsSummary: getValue(skillsSummaryIdx)
              };
            })
            .filter(p => p !== null);

          if (players.length > 0) {
            success = true;
            console.log(`Loaded ${players.length} key players from tab: ${tab}`);
            break;
          }
        } catch (err) {
          console.log(`Could not fetch from tab "${tab}":`, err.message);
        }
      }

      if (success) {
        setKeyPlayers(players);
        setError(null);
      } else {
        setError('No data found in Google Sheets. Make sure the Form has responses.');
      }

      setLoading(false);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again');
      } else {
        console.error('Error fetching key players:', err);
        setError(err.message);
      }
      setLoading(false);
    } finally {
      clearTimeout(timeoutId);
    }
  }, [sheetId, tabName]);

  useEffect(() => {
    fetchKeyPlayers();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchKeyPlayers]);

  const refreshData = useCallback(() => {
    fetchKeyPlayers();
  }, [fetchKeyPlayers]);

  const exportToCSV = useCallback(() => {
    const headers = ['name', 'role', 'stack', 'notes', 'cvLink', 'skillsSummary', 'timestamp'];
    const csvContent = [
      headers.join(','),
      ...keyPlayers.map(p =>
        headers.map(h => `"${(p[h] || '').toString().replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'keyplayers.csv';
    link.click();
  }, [keyPlayers]);

  const saveKeyPlayer = useCallback(async () => {
    console.warn('saveKeyPlayer is disabled. Use Google Form to add new entries.');
    return null;
  }, []);

  const deleteKeyPlayer = useCallback(async () => {
    console.warn('deleteKeyPlayer is disabled. Edit Google Sheet directly to remove entries.');
    return null;
  }, []);

  return {
    keyPlayers,
    loading,
    error,
    saveKeyPlayer,
    deleteKeyPlayer,
    exportToCSV,
    refreshData
  };
};

export default useKeyPlayers;