import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { absoluteUrl } from '@/lib/seo';
import { ROUTES } from '@/constants/routes';

/**
 * Consistent header + wrapper for content/legal pages. Renders a title band,
 * breadcrumb and prose container.
 */
export function ContentPage({ title, description, breadcrumb = [], children }) {
  const location = useLocation();

  return (
    <>
      <Helmet>
        <title>{title} · Online Chasmewala</title>
        {description && <meta name="description" content={description} />}
        <link rel="canonical" href={absoluteUrl(location.pathname)} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${title} · Online Chasmewala`} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:url" content={absoluteUrl(location.pathname)} />
      </Helmet>

      <div className="border-b border-navy-100 bg-surface">
        <div className="container-page py-10">
          <Breadcrumb
            className="mb-4"
            items={[{ label: 'Home', to: ROUTES.home }, ...breadcrumb, { label: title }]}
          />
          <h1 className="text-h1 text-navy-900">{title}</h1>
          {description && <p className="mt-3 max-w-2xl text-navy-500">{description}</p>}
        </div>
      </div>

      <div className="container-page py-12">{children}</div>
    </>
  );
}

export default ContentPage;
