
export const WORK_QUERY = `*[
  _type == "work"
  && defined(slug.current)
]|order(order asc, _createdAt desc){
  _id,
  title,
  dateRange,
  slug,
  likes,
  mainImage{
    alt,
    asset
  },
  hoverImage{
    alt,
    asset
  },
  "hasCaseStudy": count(caseStudy) > 0,
  comingSoon
}`;
