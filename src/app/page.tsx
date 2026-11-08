import { Hero } from "@/components/Hero";
import { HomeCta } from "@/components/HomeCta";
import { HomeProof } from "@/components/HomeProof";
import { HotItems } from "@/components/HotItems";
import { PopularCategories } from "@/components/PopularCategories";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularCategories />
      <HomeProof />
      <HotItems />
      <HomeCta />
    </>
  );
}
