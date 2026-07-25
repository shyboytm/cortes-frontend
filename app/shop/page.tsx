import type { Metadata } from "next";
import { type SanityDocument } from "next-sanity";
import { client, sanityFetchOptions } from "@/sanity/client";
import PrimaryNav from "@/components/ui/PrimaryNav";
import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";
import { resolvePageMetadata } from "@/lib/page-meta";

const PRODUCTS_QUERY = `*[
  _type == "product"
] | order(order asc, _createdAt asc){
  _id, title, description, priceLabel, storefront, url, likes,
  image{ alt, asset }
}`;

const options = sanityFetchOptions(900);

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata(
    "shop",
    {
      title: "Shop — Dennis Cortés",
      description:
        "A few things I've made that you can buy to support me directly and get something cool in return.",
    },
    "/shop"
  );
}

export default async function ShopPage() {
  const products = await client.fetch<SanityDocument[]>(PRODUCTS_QUERY, {}, options);

  return (
    <div className="pt-32 pb-24">
      <PrimaryNav />

      <div className="px-6">
        <PageHeader
          title="Shop"
          subtitle="A few things I've made that you can buy to support me directly and get something cool in return."
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
