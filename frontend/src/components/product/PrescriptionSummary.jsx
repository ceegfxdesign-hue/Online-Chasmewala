/** Read-only prescription snapshot shared by customer and admin order details. */
export function PrescriptionSummary({ prescription }) {
  if (!prescription?.method) return null;
  return (
    <div className="mt-2 space-y-1 text-xs text-navy-600">
      <p>
        Prescription:{' '}
        {prescription.method === 'later'
          ? 'Submit power later'
          : prescription.method === 'upload'
            ? 'Uploaded prescription'
            : 'Entered manually'}
      </p>
      {Object.entries(prescription.values || {}).map(([key, value]) => (
        <p key={key}>
          {key.replace('rightEye:', 'Right eye · ').replace('leftEye:', 'Left eye · ')}: {value}
        </p>
      ))}
      {prescription.fileName &&
        (prescription.fileData &&
        /^data:(application\/pdf|image\/(png|jpeg|gif|webp));base64,/.test(
          prescription.fileData
        ) ? (
          <a
            className="text-brand-700 underline"
            href={prescription.fileData}
            download={prescription.fileName}
          >
            Download {prescription.fileName}
          </a>
        ) : (
          <p>{prescription.fileName}</p>
        ))}
    </div>
  );
}
