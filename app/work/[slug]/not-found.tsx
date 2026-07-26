import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import { BackLink } from "@/components/ui/LinkPill";

export default function WorkCaseStudyNotFound() {
  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="m-auto w-full max-w-7xl px-6 md:px-10">
        <BackLink href="/work" iconSize={16} />

        <PageHeader
          title="This project doesn't exist."
          subtitle="The case study you're looking for isn't here, or may have moved."
          className="mt-6"
        />
      </div>
    </div>
  );
}
