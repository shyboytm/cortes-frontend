import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import { BackLink } from "@/components/ui/LinkPill";

// Rendered automatically by Next when the page.tsx above calls notFound()
// because a /writing/[slug] doesn't resolve to a Sanity document.
export default function WritingPostNotFound() {
  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <BackLink href="/writing" iconSize={18} />

        <PageHeader
          title="This post doesn't exist."
          subtitle="The post you're looking for isn't here, or may have moved."
          className="mt-6"
        />
      </div>
    </div>
  );
}
