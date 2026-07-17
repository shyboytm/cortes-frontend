import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";

const PRODUCTS_QUERY = `*[
  _type == "product"
] | order(order asc, _createdAt asc){
  _id, title, description, priceLabel, storefront, url, likes,
  image{ alt, asset }
}`;

const options = { next: { revalidate: 30 } };

// Each product card links out to wherever it's sold (Gumroad, Etsy, a Notion
// template marketplace, etc.) rather than handling checkout on this site.
// Shows an empty-state message if no products exist in Sanity yet.
export default async function ShopPage() {
  const products = await client.fetch<SanityDocument[]>(PRODUCTS_QUERY, {}, options);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <PageHeader
          title="Shop"
          subtitle="A few things I've made that you can actually buy."
        />

        {products.length === 0 ? (
          <p className="text-black/60 dark:text-white/60">
            Nothing here yet — add a product in Sanity to get started.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product._id}>
                <ProductCard
                  id={product._id}
                  title={product.title}
                  description={product.description}
                  priceLabel={product.priceLabel}
                  storefront={product.storefront}
                  url={product.url}
                  image={product.image}
                  likes={product.likes}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
