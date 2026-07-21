import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';
import {
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useRemoveAddressMutation,
} from '@/features/account/accountApi';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { zodResolver } from '@/lib/validators';

const addressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(2, 'Enter the recipient name'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone'),
  line1: z.string().min(3, 'Enter the address'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Enter the city'),
  state: z.string().min(2, 'Enter the state'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  isDefault: z.boolean().optional(),
});

export default function AddressesPage() {
  const toast = useToast();
  const { data: addresses = [], isLoading } = useGetAddressesQuery();
  const [addAddress, { isLoading: adding }] = useAddAddressMutation();
  const [updateAddress, { isLoading: updating }] = useUpdateAddressMutation();
  const [removeAddress] = useRemoveAddressMutation();

  const [editing, setEditing] = useState(null); // null | 'new' | address object

  const {
    register: field,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(addressSchema) });

  const openNew = () => {
    reset({ label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: addresses.length === 0 });
    setEditing('new');
  };

  const openEdit = (addr) => {
    reset({ ...addr, line2: addr.line2 || '' });
    setEditing(addr);
  };

  const onSubmit = async (values) => {
    try {
      if (editing === 'new') {
        await addAddress(values).unwrap();
        toast.success('Address added');
      } else {
        await updateAddress({ id: editing._id, ...values }).unwrap();
        toast.success('Address updated');
      }
      setEditing(null);
    } catch (err) {
      toast.error(err?.message || 'Could not save address');
    }
  };

  const onRemove = async (addr) => {
    try {
      await removeAddress(addr._id).unwrap();
      toast.success('Address removed');
    } catch (err) {
      toast.error(err?.message || 'Could not remove address');
    }
  };

  return (
    <>
      <Helmet>
        <title>Saved Addresses · Online Chasmewala</title>
      </Helmet>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-h4 text-navy-900">Saved Addresses</h2>
        <Button size="sm" leftIcon={<FiPlus />} onClick={openNew}>
          Add address
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<FiMapPin />}
          title="No addresses saved"
          description="Add an address to speed up checkout."
          action={<Button onClick={openNew}>Add your first address</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <Card key={addr._id} elevation="soft">
              <CardBody>
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-semibold text-navy-900">{addr.label || 'Address'}</span>
                  {addr.isDefault && <Badge>Default</Badge>}
                </div>
                <p className="text-sm font-medium text-navy-800">{addr.fullName}</p>
                <p className="mt-1 text-sm text-navy-500">
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ''}
                  <br />
                  {addr.city}, {addr.state} {addr.pincode}
                </p>
                <p className="mt-1 text-sm text-navy-500">{addr.phone}</p>

                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" leftIcon={<FiEdit2 />} onClick={() => openEdit(addr)}>
                    Edit
                  </Button>
                  {!addr.isDefault && (
                    <Button size="sm" variant="ghost" onClick={() => updateAddress({ id: addr._id, isDefault: true })}>
                      Set default
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" aria-label="Delete address" className="ml-auto text-error" onClick={() => onRemove(addr)}>
                    <FiTrash2 />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add address' : 'Edit address'}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Input label="Label (Home / Work)" {...field('label')} />
          <Input label="Full name" error={errors.fullName?.message} {...field('fullName')} />
          <Input label="Phone" type="tel" error={errors.phone?.message} {...field('phone')} />
          <Input label="Pincode" error={errors.pincode?.message} {...field('pincode')} />
          <Input containerClassName="sm:col-span-2" label="Address line 1" error={errors.line1?.message} {...field('line1')} />
          <Input containerClassName="sm:col-span-2" label="Address line 2 (optional)" {...field('line2')} />
          <Input label="City" error={errors.city?.message} {...field('city')} />
          <Input label="State" error={errors.state?.message} {...field('state')} />
          <div className="sm:col-span-2">
            <Checkbox label="Set as default address" {...field('isDefault')} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" loading={adding || updating} fullWidth>
              Save address
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
