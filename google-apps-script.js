// Pega este código en Extensiones -> Apps Script dentro de tu Google Sheet
// y publícalo como "Aplicación web" (Ejecutar como: Yo | Quién tiene acceso: Cualquier persona).

function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const rows = sheet.getDataRange().getValues();
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
  const puntos = Number(body.puntos) || 0;
  const aciertos = Number(body.aciertos) || 0;
  const partidas = Number(body.partidas) || 0;
  const fecha = new Date().toLocaleDateString('es-ES');

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase() === nombre.toLowerCase()) {
      const bestPuntos = Math.max(Number(rows[i][1]) || 0, puntos);
      const bestAciertos = Math.max(Number(rows[i][2]) || 0, aciertos);
      const totalPartidas = Math.max(Number(rows[i][3]) || 0, partidas);
      sheet.getRange(i + 1, 2, 1, 4).setValues([[bestPuntos, bestAciertos, totalPartidas, fecha]]);
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  sheet.appendRow([nombre, puntos, aciertos, partidas, fecha]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
