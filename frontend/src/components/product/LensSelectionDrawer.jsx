import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  FiArrowLeft,
  FiCamera,
  FiCheck,
  FiChevronRight,
  FiEye,
  FiHelpCircle,
  FiLayers,
  FiMonitor,
  FiShield,
  FiSliders,
  FiSquare,
  FiSun,
  FiTrash2,
  FiUpload,
} from 'react-icons/fi';
import { Button, Drawer, Input, Select, Modal } from '@/components/ui';
import { normalizeFrameLenses, activeSorted, appliesTo, powerChoices } from '@/lib/frameLenses';
import { easePremium } from '@/lib/motion';
import { formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';
import { useToast } from '@/contexts/ToastContext';
import { LensPackageCard, PowerLensIllustration } from './LensPackageCard';
import { LensPackageDetails } from './LensPackageDetails';

const icons = {
  Eye: FiEye,
  Monitor: FiMonitor,
  Layers: FiLayers,
  Square: FiSquare,
  Sun: FiSun,
  Shield: FiShield,
};

const backgrounds = {
  brand: 'bg-brand-100 text-brand-700',
  purple: 'bg-purple-100 text-purple-700',
  blue: 'bg-blue-100 text-blue-700',
  grey: 'bg-navy-100 text-navy-500',
  navy: 'bg-navy-800 text-white',
};

const badges = {
  brand: 'bg-brand-100 text-brand-700',
  navy: 'bg-navy-100 text-navy-800',
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  warning: 'bg-orange-100 text-orange-700',
  accent: 'bg-purple-100 text-purple-700',
};

const card = (selected) =>
  cn(
    'w-full rounded-2xl border p-4 text-left shadow-soft transition-all duration-200',
    selected
      ? 'border-brand-500 bg-brand-50/30 ring-2 ring-brand-500/20'
      : 'border-navy-100 bg-surface hover:border-brand-300 hover:shadow-md'
  );

/** Lenskart-style interactive Select Lenses flow with optical accuracy and admin configurability. */
export function LensSelectionDrawer({
  open,
  onClose,
  configuration,
  framePrice = 0,
  frameMrp,
  frameName,
  frameImage,
  frameColor,
  frameSize,
  _frameShape,
  availableLensPackages,
  selectedOption,
  selectedPrescription,
  onComplete,
}) {
  const config = useMemo(() => normalizeFrameLenses(configuration), [configuration]);
  const copy = config.generalSettings.uiText;
  const general = config.generalSettings;
  const modes = activeSorted(config.powerTypes);
  const categories = activeSorted(config.packageCategories);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [modeId, setModeId] = useState('');
  const [packageId, setPackageId] = useState('');
  const [category, setCategory] = useState('');

  // Strictly 2 prescription methods: manual entry or doctor slip upload
  const [method, setMethod] = useState('manual');
  const [values, setValues] = useState({});
  const [file, setFile] = useState(null);
  const [details, setDetails] = useState(null);
  const [showRxHelp, setShowRxHelp] = useState(false);

  const reduced = useReducedMotion();
  const toast = useToast();

  const mode = modes.find((x) => x.id === modeId);
  const frameOnly = mode?.id === 'frame-only';

  const packages = activeSorted(config.packages).filter(
    (x) =>
      appliesTo(x, modeId) &&
      (!availableLensPackages?.length || availableLensPackages.includes(x.id))
  );
  const pack = frameOnly ? undefined : packages.find((x) => x.id === packageId);

  const visible = packages.filter(
    (p) =>
      category === 'all' ||
      !categories.length ||
      !p.categories?.length ||
      p.categories.includes(category)
  );

  const fields = config.prescriptionFields.filter(
    (x) => x.isActive !== false && appliesTo(x, modeId)
  );

  const needsPrescription = Boolean(mode?.requiresPrescription) && !frameOnly;
  const lensPrice = Number(mode?.price || 0) + Number(pack?.price || 0);

  const go = (next) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setModeId(selectedOption?.baseType || '');
    setPackageId(selectedOption?.packageId || '');
    setCategory(activeSorted(config.packageCategories)[0]?.id || '');
    setMethod(selectedPrescription?.method === 'upload' ? 'upload' : 'manual');
    setValues(selectedPrescription?.values || {});
    setFile(selectedPrescription?.fileName ? selectedPrescription : null);
    setDetails(null);
    setShowRxHelp(false);
  }, [open, config, selectedOption, selectedPrescription]);

  const chooseMode = (item) => {
    setModeId(item.id);
    if (item.id !== modeId) setPackageId('');
    setDetails(null);
    go(item.id === 'frame-only' ? 2 : 1);
  };

  const upload = (f) => {
    if (!f) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'].includes(f.type) ||
      f.size > 2 * 1024 * 1024
    ) {
      toast.error('Choose a JPG, PNG, WebP, GIF or PDF up to 2 MB.');
      return;
    }
    setFile(null);
    const reader = new FileReader();
    reader.onerror = () => toast.error('Could not read that prescription.');
    reader.onload = () =>
      setFile({ fileName: f.name, fileData: String(reader.result), mimeType: f.type });
    reader.readAsDataURL(f);
  };

  const fieldKey = (f, eye) => (eye ? eye + ':' + f.key : f.key);

  const validField = (f, value) => {
    if (value == null || value === '') return !f.required;
    if (f.fieldType === 'text') return String(value).length <= 180;
    const n = Number(value);
    return (
      Number.isFinite(n) &&
      n >= f.min &&
      n <= f.max &&
      Math.abs((n - f.min) / f.step - Math.round((n - f.min) / f.step)) < 1e-6
    );
  };

  const manualValid =
    fields.some((f) =>
      (f.scope === 'shared' ? [''] : ['rightEye', 'leftEye']).some(
        (eye) => String(values[fieldKey(f, eye)] ?? '').trim() !== ''
      )
    ) &&
    fields.every((f) =>
      (f.scope === 'shared' ? [''] : ['rightEye', 'leftEye']).every((eye) =>
        validField(f, values[fieldKey(f, eye)])
      )
    );

  const ready =
    Boolean(mode) &&
    (frameOnly || Boolean(pack)) &&
    (!needsPrescription || (method === 'manual' ? manualValid : Boolean(file?.fileData)));

  const finish = () => {
    if (!ready) return;
    const clean = {};
    fields.forEach((f) =>
      (f.scope === 'shared' ? [''] : ['rightEye', 'leftEye']).forEach((eye) => {
        const key = fieldKey(f, eye);
        if (values[key] != null && values[key] !== '') clean[key] = String(values[key]);
      })
    );
    const prescription = !needsPrescription
      ? undefined
      : method === 'upload'
        ? { method, ...file }
        : {
            method,
            values: clean,
            rightEye: Object.fromEntries(
              fields
                .filter((f) => f.scope !== 'shared')
                .map((f) => [f.key, clean['rightEye:' + f.key] || ''])
            ),
            leftEye: Object.fromEntries(
              fields
                .filter((f) => f.scope !== 'shared')
                .map((f) => [f.key, clean['leftEye:' + f.key] || ''])
            ),
            pd: clean.pd || '',
          };
    onComplete({
      lensOption: {
        type: pack ? mode.id + ':' + pack.id : mode.id,
        baseType: mode.id,
        label: [mode.label, pack?.name].filter(Boolean).join(' · '),
        subtitle: pack?.description || mode.subtitle || '',
        price: lensPrice,
        packageId: pack?.id,
      },
      prescription,
    });
    onClose();
  };

  const renderField = (f, eye) => {
    const key = fieldKey(f, eye);
    const props = {
      label: f.label,
      value: values[key] ?? '',
      required: f.required,
      helper: f.helpText,
      onChange: (e) => setValues((v) => ({ ...v, [key]: e.target.value })),
    };
    return (
      <div key={key}>
        {f.fieldType === 'text' || f.fieldType === 'number' ? (
          <Input
            {...props}
            type={f.fieldType}
            min={f.min}
            max={f.max}
            step={f.step}
            maxLength={180}
            placeholder={f.placeholder}
          />
        ) : (
          <Select
            {...props}
            options={[
              { value: '', label: f.placeholder || 'Select ' + f.label },
              ...powerChoices(f),
            ]}
          />
        )}
      </div>
    );
  };

  const footer = (
    <div className="space-y-3">
      {general.showRunningTotal && (
        <div aria-live="polite" className="flex items-center justify-between rounded-xl bg-navy-50/70 p-3 text-sm text-navy-700">
          <div>
            <span className="block text-xs uppercase tracking-wider text-navy-500">
              {copy.frame} {formatPrice(framePrice)} + {copy.lens} {formatPrice(lensPrice)}
            </span>
            <span className="text-base font-bold text-navy-900">
              {copy.total}: {formatPrice(Number(framePrice) + lensPrice)}
            </span>
          </div>
          {pack && (
            <span className="rounded-lg bg-surface px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-xs">
              {pack.name}
            </span>
          )}
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button
            variant="ghost"
            onClick={() => go(frameOnly ? 0 : step - 1)}
            leftIcon={<FiArrowLeft />}
          >
            {copy.back}
          </Button>
        ) : (
          <span />
        )}
        {step === 2 ? (
          <Button size="lg" disabled={!ready} onClick={finish} className="min-w-[160px]">
            {general.ctaText}
          </Button>
        ) : (
          <Button
            disabled={step === 0 ? !mode : !pack}
            onClick={() => go(frameOnly ? 2 : step + 1)}
          >
            {copy.continue}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={
          step === 0 ? general.drawerTitle : step === 1 ? 'Choose Lens Package' : 'Add Eye Power'
        }
        width="max-w-2xl"
        className="[&>div:first-child]:justify-center [&>div:first-child>button]:absolute [&>div:first-child>button]:right-5"
        footer={step === 2 ? footer : undefined}
      >
        <div className="overflow-hidden p-5 sm:p-6">
          {step > 0 && (
            <button
              aria-label="Back to previous step"
              onClick={() => go(frameOnly ? 0 : step - 1)}
              className="absolute left-4 top-4 z-10 rounded-full p-2 text-navy-700 hover:bg-navy-50"
            >
              <FiArrowLeft />
            </button>
          )}

          {/* Sticky Lenskart-style Frame Header Summary */}
          {frameName && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-navy-100 bg-surface-muted/40 p-2.5">
              {frameImage ? (
                <img
                  src={frameImage}
                  alt={frameName}
                  className="h-12 w-16 rounded-xl border border-navy-100 bg-white object-contain p-1"
                />
              ) : (
                <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-navy-100 text-navy-400">
                  <FiEye className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-navy-900">{frameName}</p>
                  <p className="shrink-0 text-sm font-bold text-brand-600">{formatPrice(framePrice)}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-navy-500">
                  {frameColor && <span>{frameColor}</span>}
                  {frameColor && frameSize && <span>•</span>}
                  {frameSize && <span className="capitalize">{frameSize} Size</span>}
                </div>
              </div>
            </div>
          )}

          {/* Lenskart 3-Step Stepper Header */}
          <ol className="mb-6 grid grid-cols-3 border-b border-navy-100">
            {general.stepLabels.map((label, i) => (
              <li
                key={i}
                aria-current={step === i ? 'step' : undefined}
                className={cn(
                  'relative pb-3.5 text-center text-xs font-semibold transition-colors',
                  i === step ? 'text-brand-700 font-bold' : i < step ? 'text-navy-700' : 'text-navy-400'
                )}
              >
                <span
                  className={cn(
                    'mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                    i < step
                      ? 'bg-success text-white'
                      : i === step
                        ? 'bg-[#000042] text-white shadow-xs'
                        : 'bg-navy-100 text-navy-400'
                  )}
                >
                  {i < step ? <FiCheck className="h-4 w-4 stroke-[3]" /> : i + 1}
                </span>
                <span>{label}</span>
                {i === step && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-500" />}
              </li>
            ))}
          </ol>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.section
              key={step}
              custom={direction}
              variants={{
                initial: (d) => ({ opacity: 0, x: reduced ? 0 : d * 24 }),
                enter: { opacity: 1, x: 0 },
                exit: (d) => ({ opacity: 0, x: reduced ? 0 : -d * 24 }),
              }}
              initial="initial"
              animate="enter"
              exit="exit"
              transition={{ duration: reduced ? 0 : 0.2, ease: easePremium }}
            >
              {/* STEP 0: Select Vision Need */}
              {step === 0 && (
                <>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-navy-900">{copy.powerTitle}</h3>
                      <p className="mt-0.5 text-xs text-navy-500">
                        Select how you plan to use this frame
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetails({ learn: true })}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                    >
                      {copy.learnMore || 'Learn more ›'}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {modes.map((item) => {
                      const Icon = icons[item.icon] || FiEye;
                      const isSelected = modeId === item.id;
                      return (
                        <button
                          key={item.id}
                          aria-pressed={isSelected}
                          onClick={() => chooseMode(item)}
                          className={cn(card(isSelected), 'flex items-center gap-4 group')}
                        >
                          <span
                            className={cn(
                              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105',
                              backgrounds[item.iconBgColor] || backgrounds.brand
                            )}
                          >
                            {['Eye', 'Monitor', 'Layers', 'Square'].includes(item.icon) ? (
                              <PowerLensIllustration kind={item.icon} />
                            ) : (
                              <Icon className="h-6 w-6" />
                            )}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-navy-900 text-base">{item.label}</span>
                              {item.badge && (
                                <span
                                  className={cn(
                                    'rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
                                    badges[item.badgeColor] || badges.brand
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </span>
                            <span className="mt-0.5 block text-xs sm:text-sm text-navy-500">
                              {item.subtitle}
                            </span>
                          </span>
                          <span
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors',
                              isSelected ? 'bg-brand-500 text-white' : 'bg-navy-100 text-navy-400 group-hover:bg-navy-200'
                            )}
                          >
                            {isSelected ? <FiCheck className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
                          </span>
                        </button>
                      );
                    })}
                    {!modes.length && <p>{copy.emptyPower}</p>}
                  </div>
                </>
              )}

              {/* STEP 1: Choose Lens Package */}
              {step === 1 && (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-navy-900">{copy.lensesTitle}</h3>
                    <p className="mt-0.5 text-xs text-navy-500">
                      Choose coating, blue-light filter and lens thickness
                    </p>
                  </div>
                  <div
                    role="group"
                    aria-label="Lens categories"
                    className="mb-5 flex gap-2 overflow-x-auto pb-1"
                  >
                    {[
                      ...categories.filter((c) => c.id !== 'all'),
                      { id: 'all', label: '⚪ All' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        aria-pressed={category === c.id}
                        onClick={() => setCategory(c.id)}
                        className={cn(
                          'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all',
                          category === c.id
                            ? 'border-navy-900 bg-navy-900 text-white shadow-xs'
                            : 'border-navy-200 bg-surface text-navy-700 hover:border-navy-300'
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {visible.map((p) => (
                      <LensPackageCard
                        key={p.id}
                        pack={p}
                        framePrice={framePrice}
                        frameMrp={frameMrp}
                        powerPrice={mode?.price || 0}
                        selected={packageId === p.id}
                        onSelect={() => {
                          setPackageId(p.id);
                          go(2);
                        }}
                        onDetails={() => setDetails({ pack: p })}
                        onPlay={() => setDetails({ pack: p, play: true })}
                      />
                    ))}
                  </div>
                  {!visible.length && (
                    <p className="py-8 text-center text-sm text-navy-500">{copy.emptyPackages}</p>
                  )}
                </>
              )}

              {/* STEP 2: Add Eye Power (Prescription) */}
              {step === 2 &&
                (!needsPrescription ? (
                  <div className="rounded-2xl border border-success/30 bg-green-50/50 p-6 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success text-white shadow-sm">
                      <FiCheck className="h-8 w-8 stroke-[3]" />
                    </div>
                    <h3 className="text-lg font-bold text-navy-900">{copy.ready}</h3>
                    <p className="mt-1.5 text-sm text-navy-600">{general.noPrescriptionMessage}</p>
                    <p className="mt-3 text-xs text-navy-500">
                      Click below to proceed with your selected frame and lenses.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Top 2 Method Selector Tabs (NO SUBMIT LATER) */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          id: 'manual',
                          title: copy.manualTitle,
                          subtitle: copy.manualSubtitle,
                          Icon: FiSliders,
                        },
                        {
                          id: 'upload',
                          title: copy.uploadTitle,
                          subtitle: copy.uploadSubtitle,
                          Icon: FiUpload,
                        },
                      ].map(({ id, title, subtitle, Icon }) => {
                        const isSelected = method === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setMethod(id)}
                            className={cn(
                              'relative flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all',
                              isSelected
                                ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20 shadow-xs'
                                : 'border-navy-200 bg-surface hover:border-brand-300'
                            )}
                          >
                            <div className="flex w-full items-center justify-between">
                              <span
                                className={cn(
                                  'flex h-9 w-9 items-center justify-center rounded-xl text-sm transition-colors',
                                  isSelected ? 'bg-brand-500 text-white' : 'bg-navy-100 text-navy-600'
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </span>
                              {isSelected && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
                                  <FiCheck className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <span className="mt-2.5 block text-sm font-bold text-navy-900 leading-snug">
                              {title}
                            </span>
                            <span className="mt-0.5 block text-xs text-navy-500 line-clamp-1">
                              {subtitle}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* METHOD 1: Enter Power Manually */}
                    {method === 'manual' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-navy-500">
                            Prescription Grid
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowRxHelp(true)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                          >
                            <FiHelpCircle className="h-3.5 w-3.5" />
                            Need help reading your prescription?
                          </button>
                        </div>

                        {['rightEye', 'leftEye'].map((eye, i) => (
                          <fieldset
                            key={eye}
                            className="rounded-2xl border border-navy-100 bg-surface p-4 shadow-xs"
                          >
                            <legend className="rounded-lg bg-navy-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-navy-800">
                              {i === 0 ? copy.rightEye : copy.leftEye}
                            </legend>
                            <div className="mt-2 grid gap-3 sm:grid-cols-3">
                              {fields
                                .filter((f) => f.scope !== 'shared')
                                .map((f) => renderField(f, eye))}
                            </div>
                          </fieldset>
                        ))}

                        {/* Shared Fields (e.g. Pupillary Distance PD) */}
                        {fields.filter((f) => f.scope === 'shared').length > 0 && (
                          <div className="rounded-2xl border border-navy-100 bg-surface p-4 shadow-xs">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-navy-700">
                                Pupillary Distance (PD)
                              </span>
                              <span className="text-[11px] text-navy-400">
                                Average adult PD is 63 mm
                              </span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                              {fields
                                .filter((f) => f.scope === 'shared')
                                .map((f) => renderField(f, ''))}
                            </div>
                          </div>
                        )}

                        {!manualValid && (
                          <p role="status" className="rounded-xl bg-navy-50 p-3 text-center text-xs text-navy-600">
                            {copy.requiredMessage}
                          </p>
                        )}
                      </div>
                    )}

                    {/* METHOD 2: Upload Prescription */}
                    {method === 'upload' && (
                      <div className="space-y-4">
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            upload(e.dataTransfer.files[0]);
                          }}
                          className={cn(
                            'rounded-2xl border-2 border-dashed p-6 text-center transition-colors',
                            file
                              ? 'border-brand-500 bg-brand-50/20'
                              : 'border-navy-200 bg-surface-muted/30 hover:border-brand-400'
                          )}
                        >
                          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
                            <FiCamera className="h-7 w-7" />
                          </div>
                          <p className="font-bold text-navy-900">{copy.chooseFile}</p>
                          <p className="mt-1 text-xs text-navy-500">{copy.dropFile}</p>

                          <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-600 transition-colors">
                            Browse or Take Photo
                            <input
                              aria-label="Upload prescription file"
                              type="file"
                              accept="image/*,.pdf"
                              capture="environment"
                              onChange={(e) => upload(e.target.files[0])}
                              className="sr-only"
                            />
                          </label>

                          {file?.fileName && (
                            <div className="mt-4 flex items-center justify-between rounded-xl border border-navy-100 bg-surface p-3 text-left">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-xs font-bold uppercase text-brand-600">
                                  {file.fileName.split('.').pop() || 'DOC'}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-navy-900">
                                    {file.fileName}
                                  </p>
                                  <p className="text-[11px] font-medium text-success">
                                    Prescription loaded successfully
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-50 hover:text-red-600"
                                title="Remove file"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-3.5">
                          <FiShield className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                          <p className="text-xs leading-relaxed text-navy-700">
                            <strong>Certified Optometrist Verification:</strong> Our optical specialists review every uploaded doctor slip before precision lens cutting to guarantee 100% optical accuracy.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </motion.section>
          </AnimatePresence>
        </div>
      </Drawer>

      {/* Modal: About Power Types */}
      <Modal
        open={Boolean(details?.learn)}
        onClose={() => setDetails(null)}
        title="About power types"
      >
        <div className="space-y-3.5">
          {modes.map((item) => (
            <section key={item.id} className="rounded-xl border border-navy-100 p-3.5">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-navy-900 text-sm">{item.label}</h3>
                {item.badge && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      badges[item.badgeColor] || badges.brand
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-navy-600">{item.subtitle}</p>
            </section>
          ))}
        </div>
      </Modal>

      {/* Modal: Prescription Reading Guide */}
      <Modal
        open={showRxHelp}
        onClose={() => setShowRxHelp(false)}
        title="Understanding Your Eye Prescription"
      >
        <div className="space-y-4 text-sm text-navy-700">
          <p className="text-xs text-navy-500">
            Eye doctors use standard medical terms on prescription slips. Here is a quick guide to reading your values:
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-xl border border-navy-100 p-3 bg-surface">
              <span className="font-bold text-brand-600 text-xs uppercase tracking-wider">OD (Right Eye)</span>
              <p className="mt-1 text-xs text-navy-600">Oculus Dexter: Optical correction values for your right eye.</p>
            </div>
            <div className="rounded-xl border border-navy-100 p-3 bg-surface">
              <span className="font-bold text-brand-600 text-xs uppercase tracking-wider">OS (Left Eye)</span>
              <p className="mt-1 text-xs text-navy-600">Oculus Sinister: Optical correction values for your left eye.</p>
            </div>
            <div className="rounded-xl border border-navy-100 p-3 bg-surface">
              <span className="font-bold text-navy-900 text-xs">SPH (Sphere)</span>
              <p className="mt-1 text-xs text-navy-600">
                Minus (-) indicates nearsightedness (myopia). Plus (+) indicates farsightedness (hyperopia).
              </p>
            </div>
            <div className="rounded-xl border border-navy-100 p-3 bg-surface">
              <span className="font-bold text-navy-900 text-xs">CYL (Cylinder) & Axis</span>
              <p className="mt-1 text-xs text-navy-600">
                Corrects astigmatism. CYL is power; Axis is angle (1° to 180°). Leave blank if not present on your slip.
              </p>
            </div>
            <div className="rounded-xl border border-navy-100 p-3 bg-surface">
              <span className="font-bold text-navy-900 text-xs">ADD (Add Power)</span>
              <p className="mt-1 text-xs text-navy-600">
                Magnifying power for reading in bifocal or progressive lenses (typically +0.75 to +3.50).
              </p>
            </div>
            <div className="rounded-xl border border-navy-100 p-3 bg-surface">
              <span className="font-bold text-navy-900 text-xs">PD (Pupillary Distance)</span>
              <p className="mt-1 text-xs text-navy-600">
                Distance between pupil centers in millimeters. Standard adult average is 63 mm.
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-brand-50 p-3 text-xs text-brand-800">
            💡 <em>Tip: If you&apos;re unsure about any number, simply choose <strong>Upload Prescription</strong> and our optometrists will read and verify it for you!</em>
          </div>
        </div>
      </Modal>

      {/* Package comparison drawer */}
      {details?.pack && (
        <LensPackageDetails
          key={details.pack.id}
          pack={details.pack}
          framePrice={framePrice}
          frameMrp={frameMrp}
          powerPrice={mode?.price || 0}
          onClose={() => setDetails(null)}
          onSelect={() => {
            setPackageId(details.pack.id);
            setDetails(null);
            go(2);
          }}
        />
      )}
    </>
  );
}
