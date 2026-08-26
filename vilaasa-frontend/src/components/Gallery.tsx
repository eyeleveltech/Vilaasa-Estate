import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface GalleryImage {
  name: string;
  description: string;
  image: string;
}

const Gallery = ({
  property,
}: {
  property: { galleryImages: GalleryImage[] };
}) => {
  const images = property.galleryImages || [];
  const [index, setIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  const pageCount = useMemo(
    () => Math.max(Math.ceil(images.length / itemsPerView), 1),
    [images.length, itemsPerView],
  );
  const maxIndex = pageCount - 1;

  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(window.innerWidth >= 768 ? 2 : 1);
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  useEffect(() => {
    setIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const next = () => {
    setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prev = () => {
    setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenIndex(null);
      if (e.key === "ArrowRight" && fullscreenIndex === null) {
        setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }
      if (e.key === "ArrowLeft" && fullscreenIndex === null) {
        setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
      }
      if (e.key === "ArrowRight" && fullscreenIndex !== null) {
        setFullscreenIndex((i) => (i! < images.length - 1 ? i! + 1 : i));
      }
      if (e.key === "ArrowLeft" && fullscreenIndex !== null) {
        setFullscreenIndex((i) => (i! > 0 ? i! - 1 : i));
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreenIndex, images.length, maxIndex]);

  return (
    <section className="border-y border-border bg-card px-4 py-12 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <span className="text-base font-bold uppercase tracking-[0.2em] text-primary/60 sm:text-xl">
            Gallery
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              aria-label="Previous gallery slide"
              className="rounded border border-border p-2 transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={images.length <= itemsPerView}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button
              onClick={next}
              aria-label="Next gallery slide"
              className="rounded border border-border p-2 transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={images.length <= itemsPerView}
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {images.length === 0 && (
          <div className="rounded border border-border bg-background/40 p-6 text-sm text-muted-foreground">
            No gallery images available.
          </div>
        )}

        {images.length > 0 && (
          <>
            <div className="-mx-2 overflow-hidden">
              <motion.div
                className="flex"
                animate={{ x: `-${index * 100}%` }}
                transition={{ type: "spring", stiffness: 140, damping: 22 }}
              >
                {images.map((plan: GalleryImage, idx: number) => (
                  <div key={idx} className="w-full shrink-0 px-2 md:w-1/2">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="group"
                    >
                      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg md:mb-4">
                        <img
                          src={plan.image}
                          alt={plan.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <button
                          onClick={() => setFullscreenIndex(idx)}
                          className="absolute bottom-3 right-3 flex items-center gap-1 rounded bg-background/90 px-3 py-1.5 text-xs text-foreground backdrop-blur-sm transition-colors hover:bg-primary hover:text-primary-foreground md:bottom-4 md:right-4 md:gap-2 md:px-4 md:py-2 md:text-sm"
                        >
                          <span className="material-symbols-outlined text-base md:text-lg">
                            open_in_full
                          </span>
                          Fullscreen
                        </button>
                      </div>

                      {plan.description && plan.description.trim() !== "" && (
                        <p className="text-sm text-foreground/90 md:text-lg">
                          {plan.description.charAt(0).toUpperCase() +
                            plan.description.slice(1)}
                        </p>
                      )}
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </div>

            {pageCount > 1 && (
              <div className="mt-5 flex items-center justify-center gap-2 md:mt-6">
                {Array.from({ length: pageCount }).map((_, page) => (
                  <button
                    key={page}
                    onClick={() => setIndex(page)}
                    aria-label={`Go to gallery page ${page + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      index === page
                        ? "w-6 bg-primary"
                        : "w-2 bg-border hover:bg-primary/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {fullscreenIndex !== null && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenIndex(null)}
          >
            <motion.img
              src={images[fullscreenIndex].image}
              alt={images[fullscreenIndex].name}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={() => setFullscreenIndex(null)}
              className="absolute right-4 top-4 rounded border border-white/30 bg-black/40 p-2 text-white transition-colors hover:bg-white/20 md:right-6 md:top-6"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {fullscreenIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreenIndex((i) => (i as number) - 1);
                }}
                className="absolute left-2 rounded border border-white/30 bg-black/40 p-2 text-white transition-colors hover:bg-white/20 md:left-6"
              >
                <span className="material-symbols-outlined text-3xl">
                  chevron_left
                </span>
              </button>
            )}

            {fullscreenIndex < images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreenIndex((i) => (i as number) + 1);
                }}
                className="absolute right-2 rounded border border-white/30 bg-black/40 p-2 text-white transition-colors hover:bg-white/20 md:right-6"
              >
                <span className="material-symbols-outlined text-3xl">
                  chevron_right
                </span>
              </button>
            )}

            <div className="absolute bottom-4 rounded bg-black/50 px-3 py-1 text-xs text-white/90">
              {fullscreenIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
