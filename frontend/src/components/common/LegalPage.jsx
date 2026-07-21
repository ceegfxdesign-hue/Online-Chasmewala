import { ContentPage } from '@/components/common/ContentPage';

/**
 * Renders a legal/policy page from a list of `{ heading, body }` sections.
 * `body` may be a string or an array of paragraphs/bullet arrays.
 */
export function LegalPage({ title, description, updated, sections }) {
  return (
    <ContentPage title={title} description={description}>
      <div className="mx-auto max-w-3xl">
        {updated && <p className="mb-8 text-sm text-navy-400">Last updated: {updated}</p>}
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-h4 text-navy-900">{s.heading}</h2>
              <div className="mt-2 space-y-3 text-navy-600">
                {(Array.isArray(s.body) ? s.body : [s.body]).map((block, i) =>
                  Array.isArray(block) ? (
                    // eslint-disable-next-line react/no-array-index-key
                    <ul key={i} className="list-disc space-y-1.5 pl-5">
                      {block.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  ) : (
                    // eslint-disable-next-line react/no-array-index-key
                    <p key={i}>{block}</p>
                  )
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </ContentPage>
  );
}

export default LegalPage;
