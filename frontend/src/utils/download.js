// Triggers a browser download for a Blob response from an authenticated API
// call. Needed because export endpoints require the JWT auth header, which a
// plain <a href> link can't send — so we fetch via axios (responseType:
// 'blob') and synthesize the download client-side instead.
export const downloadBlob = (blobData, filename) => {
  const url = URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
