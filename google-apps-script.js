// Pega este código en Extensiones -> Apps Script dentro de tu Google Sheet
// y publícalo como "Aplicación web" (Ejecutar como: Yo | Quién tiene acceso: Cualquier persona).

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const rows = sheet.getDataRange().getValues();

  if (e && e.parameter && e.parameter.nombre) {
    const nombre = String(e.parameter.nombre).trim().toLowerCase();
    const clave = String(e.parameter.clave || '');
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).trim().toLowerCase() === nombre) {
        const savedPass = String(rows[i][5] || '');
        if (savedPass && savedPass !== clave) {
          return ContentService.createTextOutput(JSON.stringify({ status: 'wrong_password' })).setMimeType(ContentService.MimeType.JSON);
        }
        return ContentService.createTextOutput(JSON.stringify({
          status: 'ok',
          puntos: Number(rows[i][1]) || 0,
          aciertos: Number(rows[i][2]) || 0,
          partidas: Number(rows[i][3]) || 0,
          progreso: rows[i][6] || ''
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'new' })).setMimeType(ContentService.MimeType.JSON);
  }

  const data = rows.slice(1).map(r => ({
    nombre: r[0],
    puntos: Number(r[1]) || 0,
    aciertos: Number(r[2]) || 0,
    partidas: Number(r[3]) || 0,
    fecha: r[4] || ''
  }));
  data.sort((a, b) => b.puntos - a.puntos);
  return ContentService
    .createTextOutput(JSON.stringify(data.slice(0, 20)))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const body = JSON.parse(e.postData.contents);
  const nombre = String(body.nombre || 'Anónimo').trim().slice(0, 24);
  const clave = String(body.clave || '').slice(0, 24);
  const puntos = Number(body.puntos) || 0;
  const aciertos = Number(body.aciertos) || 0;
  const partidas = Number(body.partidas) || 0;
  const progreso = String(body.progreso || '');
  const fecha = new Date().toLocaleDateString('es-ES');

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim().toLowerCase() === nombre.toLowerCase()) {
      const savedPass = String(rows[i][5] || '');
      if (savedPass && savedPass !== clave) {
        return ContentService.createTextOutput(JSON.stringify({ ok: false })).setMimeType(ContentService.MimeType.JSON);
      }
      const bestPuntos = Math.max(Number(rows[i][1]) || 0, puntos);
      const bestAciertos = Math.max(Number(rows[i][2]) || 0, aciertos);
      const totalPartidas = Math.max(Number(rows[i][3]) || 0, partidas);
      sheet.getRange(i + 1, 2, 1, 6).setValues([[bestPuntos, bestAciertos, totalPartidas, fecha, savedPass || clave, progreso || rows[i][6] || '']]);
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  sheet.appendRow([nombre, puntos, aciertos, partidas, fecha, clave, progreso]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
