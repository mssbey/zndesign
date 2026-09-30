"use client";
import { createContext, useContext, useMemo } from "react";
import { categoryName, type Category, type Collection } from "@/lib/data";

const TaxonomyContext = createContext<{ categories: Category[]; collections: Collection[] }>({
  categories: [],
  collections: [],
});

export function TaxonomyProvider({
  categories,
  collections,
  children,
}: {
  categories: Category[];
  collections: Collection[];
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ categories, collections }), [categories, collections]);
  return <TaxonomyContext value={value}>{children}</TaxonomyContext>;
}

export function useTaxonomy() {
  const { categories, collections } = useContext(TaxonomyContext);
  return { categories, collections, categoryName: (slug: string) => categoryName(categories, slug) };
}
