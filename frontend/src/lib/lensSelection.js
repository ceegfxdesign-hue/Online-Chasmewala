function legacyPrescriptionValues(prescription = {}) {
  const values = {};
  const addEye = (eye, label) => {
    const data = prescription?.[eye] || {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== '' && value != null) values[`${label} · ${key.toUpperCase()}`] = String(value);
    });
  };

  addEye('rightEye', 'Right eye');
  addEye('leftEye', 'Left eye');
  if (prescription.pd !== '' && prescription.pd != null) values.PD = String(prescription.pd);
  return values;
}

export function prescriptionEntries(prescription) {
  if (!prescription) return [];
  const rawSource = prescription.values instanceof Map
    ? Object.fromEntries(prescription.values)
    : prescription.values || legacyPrescriptionValues(prescription);
  const source = Object.entries(rawSource).reduce((result, [key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const eyeLabel = key === 'rightEye' ? 'Right eye' : key === 'leftEye' ? 'Left eye' : key;
      Object.entries(value).forEach(([field, fieldValue]) => {
        result[`${eyeLabel} · ${field.toUpperCase()}`] = fieldValue;
      });
    } else {
      result[key] = value;
    }
    return result;
  }, {});

  return Object.entries(source)
    .filter(([, value]) => value !== '' && value != null)
    .map(([label, value]) => ({ label, value: String(value) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function lensConfigurationKey(item = {}) {
  const lens = item.lensOption || {};
  const manualPrescription = prescriptionEntries(item.prescription)
    .map(({ label, value }) => `${label}=${value}`)
    .join('|');
  const upload = item.prescription?.method === 'upload' ? item.prescription : null;
  const uploadData = upload?.fileData || '';
  let uploadHash = 2166136261;
  for (let index = 0; index < uploadData.length; index += 1) {
    uploadHash ^= uploadData.charCodeAt(index);
    uploadHash = Math.imul(uploadHash, 16777619);
  }
  const prescription = upload
    ? `upload=${upload.fileName || ''}:${upload.mimeType || ''}:${uploadData.length}:${uploadHash >>> 0}`
    : manualPrescription;

  return [
    lens.type || lens.baseType || 'none',
    lens.baseType || 'no-base-type',
    lens.packageId || 'no-package',
    lens.colour || 'no-colour',
    prescription || 'no-prescription',
  ].join('::');
}
