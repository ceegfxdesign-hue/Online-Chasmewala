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
  const prescription = prescriptionEntries(item.prescription)
    .map(({ label, value }) => `${label}=${value}`)
    .join('|');

  return [
    lens.type || lens.baseType || 'none',
    lens.baseType || 'no-base-type',
    lens.packageId || 'no-package',
    lens.colour || 'no-colour',
    prescription || 'no-prescription',
  ].join('::');
}
