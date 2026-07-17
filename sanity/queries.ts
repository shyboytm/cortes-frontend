// Shared GROQ queries used by more than one page.

// Featured work items, used by both the homepage and the /work index page.
export const WORK_QUERY = `*[
  _type == "work"
  && defined(slug.current)
]|order(order asc, _createdAt desc){
  _id,
  title,
  dateRange,
  slug,
  mainImage{
    alt,
    asset
  },
  hoverImage{
    alt,
    asset
  },
  "hasCaseStudy": count(caseStudy) > 0
}`;
