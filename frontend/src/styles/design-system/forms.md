# Forms & Inputs

Primitives: [`Input`](../../components/ui/Input.jsx), [`Select`](../../components/ui/Select.jsx),
[`Checkbox`](../../components/ui/Checkbox.jsx), [`Radio`](../../components/ui/Radio.jsx).
Forms use **React Hook Form + Zod** for validation.

## Anatomy

```
Label (required *)
[ leading icon ]  input field  [ trailing icon ]
Helper text  /  Error message
```

## States

| State    | Treatment                                             |
| -------- | ----------------------------------------------------- |
| Default  | `navy-200` border, white background                   |
| Focus    | brand ring, brand border                              |
| Filled   | unchanged                                             |
| Error    | `error` border + ring, error message below, `aria-invalid` |
| Disabled | muted background, `cursor-not-allowed`                |

## Rules

- Every field has an associated `<label>` (visible or `sr-only`) tied via `htmlFor`/`id`.
- Error text is linked with `aria-describedby` and announced to screen readers.
- Validation runs on blur and on submit (not on every keystroke) to avoid noise.
- Inputs are min 44px tall for touch targets.
- Placeholders are hints, never the sole label.

## Example

```jsx
<Input
  label="Email"
  type="email"
  {...register('email')}
  error={errors.email?.message}
  leftIcon={<FiMail />}
/>
```
