import { DeliveryHighlights } from "@/components/DeliveryHighlights";
import { Hero } from "@/components/Hero";
import { HomeCta } from "@/components/HomeCta";
import { HotItems } from "@/components/HotItems";
import { PopularCategories } from "@/components/PopularCategories";
import { SupportHighlight } from "@/components/SupportHighlight";
import { TrustRobux } from "@/components/TrustRobux";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularCategories />
      <TrustRobux />
      <DeliveryHighlights />
      <SupportHighlight />
      <HotItems />
      <HomeCta />
    </>
  );
}
