import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    id: "grow-a-garden",
    name: "Grow a Garden 2",
    href: "/gamepasses",
    image: "/photos/3.png",
  },
  {
    id: "blox-fruits",
    name: "Blox Fruits",
    href: "/gamepasses",
    image: "/photos/4.png",
  },
  {
    id: "sailor-piece",
    name: "Sailor Piece",
    href: "/gamepasses",
    image: "/photos/2.png",
  },
];

export function PopularCategories() {
  return (
    <section className="popular-categories relative -mt-[3cm] overflow-hidden pt-14 pb-0 md:pt-16">
      <div className="relative z-10 mx-auto w-[min(1400px,calc(100%-1.25rem))]">
        <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
          Categorias populares
        </h2>

        <div className="mt-6 grid gap-3 md:grid-cols-3 md:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative aspect-video overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, 460px"
                className="object-contain object-center transition duration-300 group-hover:scale-[1.02]"
                priority
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
