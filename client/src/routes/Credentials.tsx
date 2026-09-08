import { getAwards } from '@/lib/api';
import { useResource } from '@/hooks/useResource';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fallbackAwards } from '@/data/fallback';
import { AwardCard } from '@/components/AwardCard';
import { Page, SectionHeading } from '@/components/ui';

export function Credentials() {
  useDocumentTitle(
    'Credentials',
    'Competitions Bryan Chua has won and certifications he holds.',
  );

  const { data: awards } = useResource(getAwards, fallbackAwards);

  return (
    <Page>
      <SectionHeading
        level={1}
        eyebrow="Recognition"
        title="Credentials"
        description="Competitions where the work held up against other teams, and courses I finished along the way."
      />

      {awards.length > 0 ? (
        <div className="grid gap-4">
          {awards.map((award) => (
            <AwardCard key={award.id} award={award} />
          ))}
        </div>
      ) : (
        <p className="text-muted">No awards listed yet.</p>
      )}
    </Page>
  );
}
