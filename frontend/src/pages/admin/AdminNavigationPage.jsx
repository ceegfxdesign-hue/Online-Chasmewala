import { useEffect, useState } from 'react';
import { FiChevronDown, FiLink, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Button, Card, CardBody, Input, Skeleton } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { MEGA_MENU } from '@/constants/navigation';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/admin/adminApi';

const CONTACT_LENS_DEFAULT = {
  label: 'Contact Lenses',
  slug: 'contact-lenses',
  columns: [
    {
      title: 'Clear Contacts',
      links: [
        { label: 'Distance Power', to: '/products?category=contact-lenses&contactLensType=clear&powerType=with-power' },
        { label: 'Toric / Cylindrical', to: '/products?category=contact-lenses&contactLensType=clear&lensType=toric' },
      ],
    },
    {
      title: 'Colour Contacts',
      links: [
        { label: 'Zero Power', to: '/products?category=contact-lenses&contactLensType=color&powerType=zero-power' },
        { label: 'With Power', to: '/products?category=contact-lenses&contactLensType=color&powerType=with-power' },
      ],
    },
    {
      title: 'Solutions & Accessories',
      links: [
        { label: 'Solutions', to: '/products?category=contact-lenses&contactLensType=solution' },
        { label: 'Accessories', to: '/products?category=contact-lenses&contactLensType=accessory' },
      ],
    },
  ],
};

const FALLBACK_MENUS = MEGA_MENU
  .filter((item) => ['eyeglasses', 'sunglasses'].includes(item.slug))
  .map((item) => ({ key: item.slug, ...item }))
  .concat({ key: 'contact-lenses', ...CONTACT_LENS_DEFAULT });

const makeKey = () => Math.random().toString(36).slice(2);
const toDraft = (menu) => ({
  ...menu,
  key: menu.key || menu.slug,
  draftKey: makeKey(),
  columns: (menu.columns || []).map((column) => ({
    ...column,
    draftKey: makeKey(),
    links: (column.links || []).map((link) => ({ ...link, draftKey: makeKey() })),
  })),
});

const toRequest = (menu) => ({
  key: menu.key,
  label: menu.label.trim(),
  slug: menu.slug,
  columns: menu.columns.map((column) => ({
    title: column.title.trim(),
    links: column.links.map((link) => ({ label: link.label.trim(), to: link.to.trim() })),
  })),
});

export default function AdminNavigationPage() {
  const { data, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const toast = useToast();
  const [menus, setMenus] = useState(() => FALLBACK_MENUS.map(toDraft));

  useEffect(() => {
    if (!Array.isArray(data?.navigationMenus) || data.navigationMenus.length !== 3) return;
    setMenus(data.navigationMenus.map(toDraft));
  }, [data?.navigationMenus]);

  const updateMenu = (menuIndex, nextMenu) => {
    setMenus((items) => items.map((menu, index) => (index === menuIndex ? nextMenu(menu) : menu)));
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      await updateSettings({ navigationMenus: menus.map(toRequest) }).unwrap();
      toast.success('Dropdown menus saved');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-20" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h3 text-navy-900">Dropdown Menus</h1>
        <p className="mt-1 text-sm text-navy-500">Control the dropdown links shown for Eyeglasses, Sunglasses, and Contact Lenses in the storefront navigation.</p>
      </div>

      <form onSubmit={save} className="space-y-6">
        {menus.map((menu, menuIndex) => (
          <Card key={menu.draftKey}>
            <CardBody className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-navy-100 pb-5">
                <div>
                  <p className="flex items-center gap-2 text-lg font-semibold text-navy-900"><FiChevronDown className="text-brand-600" /> {menu.label || 'Dropdown menu'}</p>
                  <p className="mt-1 text-sm text-navy-500">The category destination stays linked to <span className="font-medium">{menu.slug}</span>.</p>
                </div>
                <div className="w-full sm:w-72">
                  <Input
                    label="Navigation label"
                    value={menu.label}
                    maxLength={40}
                    required
                    onChange={(event) => updateMenu(menuIndex, (entry) => ({ ...entry, label: event.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {menu.columns.map((column, columnIndex) => (
                  <div key={column.draftKey} className="rounded-2xl border border-navy-100 bg-surface-subtle p-4">
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                      <div className="w-full sm:w-[26rem]">
                        <Input
                          label={`Column ${columnIndex + 1} heading`}
                          value={column.title}
                          maxLength={80}
                          required
                          onChange={(event) => updateMenu(menuIndex, (entry) => ({
                            ...entry,
                            columns: entry.columns.map((item, index) => index === columnIndex ? { ...item, title: event.target.value } : item),
                          }))}
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-error hover:bg-error-light"
                        leftIcon={<FiTrash2 />}
                        disabled={menu.columns.length === 1}
                        onClick={() => updateMenu(menuIndex, (entry) => ({
                          ...entry,
                          columns: entry.columns.filter((_, index) => index !== columnIndex),
                        }))}
                      >
                        Remove column
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {column.links.map((link, linkIndex) => (
                        <div key={link.draftKey} className="grid gap-3 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)_auto]">
                          <Input
                            label={`Link ${linkIndex + 1} label`}
                            value={link.label}
                            maxLength={60}
                            required
                            onChange={(event) => updateMenu(menuIndex, (entry) => ({
                              ...entry,
                              columns: entry.columns.map((item, itemIndex) => itemIndex === columnIndex ? {
                                ...item,
                                links: item.links.map((itemLink, itemLinkIndex) => itemLinkIndex === linkIndex ? { ...itemLink, label: event.target.value } : itemLink),
                              } : item),
                            }))}
                          />
                          <Input
                            label="Destination link"
                            value={link.to}
                            placeholder="/products?category=eyeglasses"
                            maxLength={300}
                            required
                            leftIcon={<FiLink />}
                            helper="Use an internal link beginning with /."
                            onChange={(event) => updateMenu(menuIndex, (entry) => ({
                              ...entry,
                              columns: entry.columns.map((item, itemIndex) => itemIndex === columnIndex ? {
                                ...item,
                                links: item.links.map((itemLink, itemLinkIndex) => itemLinkIndex === linkIndex ? { ...itemLink, to: event.target.value } : itemLink),
                              } : item),
                            }))}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="self-start text-error hover:bg-error-light sm:mt-7"
                            aria-label={`Remove ${link.label || `link ${linkIndex + 1}`}`}
                            disabled={column.links.length === 1}
                            onClick={() => updateMenu(menuIndex, (entry) => ({
                              ...entry,
                              columns: entry.columns.map((item, itemIndex) => itemIndex === columnIndex ? {
                                ...item,
                                links: item.links.filter((_, itemLinkIndex) => itemLinkIndex !== linkIndex),
                              } : item),
                            }))}
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      leftIcon={<FiPlus />}
                      disabled={column.links.length >= 12}
                      onClick={() => updateMenu(menuIndex, (entry) => ({
                        ...entry,
                        columns: entry.columns.map((item, itemIndex) => itemIndex === columnIndex ? {
                          ...item,
                          links: [...item.links, { label: '', to: '', draftKey: makeKey() }],
                        } : item),
                      }))}
                    >
                      Add link
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<FiPlus />}
                disabled={menu.columns.length >= 4}
                onClick={() => updateMenu(menuIndex, (entry) => ({
                  ...entry,
                  columns: [...entry.columns, { title: '', links: [{ label: '', to: '', draftKey: makeKey() }], draftKey: makeKey() }],
                }))}
              >
                Add column
              </Button>
            </CardBody>
          </Card>
        ))}

        <div className="flex justify-end"><Button type="submit" loading={isSaving}>Save dropdown menus</Button></div>
      </form>
    </div>
  );
}
