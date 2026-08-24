import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  useVaultConstruction,
  VaultConstructionAsset,
} from "@/vault/hooks/useVaultSections";

interface VaultConstructionProps {
  assets?: VaultConstructionAsset[];
}

export function VaultConstruction({ assets: propAssets }: VaultConstructionProps = {}) {
  const { assets: hookAssets, loading } = useVaultConstruction();
  const constructionAssets = propAssets || hookAssets;
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  useEffect(() => {
    if (constructionAssets.length > 0 && !selectedAssetId) {
      setSelectedAssetId(constructionAssets[0].id);
    }
  }, [constructionAssets, selectedAssetId]);

  if (!propAssets && loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Loading live construction feed...</span>
        </div>
      </div>
    );
  }

  const selectedAsset =
    constructionAssets.find((a) => a.id === selectedAssetId) ||
    constructionAssets[0];

  // If no assets are loaded and not loading, display the "No Active Construction" message
  if (!selectedAsset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light text-foreground font-serif">Live Construction Feed</h2>
            <p className="text-muted-foreground text-sm">Real-time updates on your under-construction properties</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-muted-foreground mb-4">construction</span>
          <h3 className="text-lg font-medium text-foreground mb-2">No Active Construction</h3>
          <p className="text-muted-foreground">All your properties are currently complete or off-plan.</p>
        </div>
      </div>
    );
  }

  const assetName = selectedAsset.propertyName || (selectedAsset as any).name || "Luxury Estate";
  const galleryItems = selectedAsset.gallery || [];
  const currentGalleryItem = galleryItems[activeGalleryIndex] || galleryItems[0];
  const galleryImgUrl =
    currentGalleryItem?.imageUrl ||
    (currentGalleryItem as any)?.url ||
    selectedAsset.image;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-foreground font-serif">Live Construction Feed</h2>
          <p className="text-muted-foreground text-sm">Real-time updates on your under-construction properties</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="relative h-48">
            <img
              src={selectedAsset.image}
              alt={assetName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-semibold text-white">{assetName}</h3>
              <p className="text-white/70 text-sm">{selectedAsset.location}</p>
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 bg-gold/90 rounded-full">
              <span className="text-xs font-semibold text-gold-foreground">{selectedAsset.overallProgress}% Complete</span>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground font-medium">Structure</span>
                <span className="text-sm text-gold font-mono">{selectedAsset.structureProgress}%</span>
              </div>
              <Progress value={selectedAsset.structureProgress} className="h-3" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground font-medium">Interior Works</span>
                <span className="text-sm text-gold font-mono">{selectedAsset.interiorProgress}%</span>
              </div>
              <Progress value={selectedAsset.interiorProgress} className="h-3" />
            </div>

            {/* Milestones Timeline */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground mb-4">Construction Milestones</h4>
              <div className="space-y-4">
                {selectedAsset.milestones && selectedAsset.milestones.map((milestone, index) => {
                  const mStatus = milestone.status.toLowerCase();
                  const mDate = (milestone as any).targetDate || (milestone as any).date;
                  return (
                    <div key={milestone.id} className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          mStatus === "completed"
                            ? "bg-primary text-primary-foreground"
                            : mStatus === "in-progress" || mStatus === "in_progress"
                            ? "bg-gold text-gold-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {mStatus === "completed" ? (
                          <span className="material-symbols-outlined text-sm">check</span>
                        ) : (
                          <span className="text-xs font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            mStatus === "completed"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {milestone.name}
                        </p>
                        {mDate && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(mDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                      {(mStatus === "in-progress" || mStatus === "in_progress") && (
                        <span className="text-xs px-2 py-1 bg-gold/20 text-gold rounded-full">
                          In Progress
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Site Updates Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_library</span>
                <h3 className="font-semibold text-foreground">Site Updates</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                Updated: {new Date(selectedAsset.lastUpdate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </div>

            {/* Main Gallery Image */}
            {galleryImgUrl ? (
              <div className="relative aspect-video">
                <img
                  src={galleryImgUrl}
                  alt={currentGalleryItem?.caption || "Construction update"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  {currentGalleryItem?.caption && (
                    <p className="text-white text-xs">{currentGalleryItem.caption}</p>
                  )}
                  {currentGalleryItem?.date && (
                    <p className="text-white/60 text-xs">{currentGalleryItem.date}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center bg-secondary/40 text-xs text-muted-foreground">
                No site photos logged yet
              </div>
            )}

            {/* Gallery Thumbnails */}
            {galleryItems.length > 0 && (
              <div className="p-3 flex gap-2 overflow-x-auto">
                {galleryItems.map((item, index) => {
                  const thumb = item.imageUrl || (item as any).url;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveGalleryIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        index === activeGalleryIndex ? "border-gold" : "border-transparent"
                      }`}
                    >
                      <img src={thumb} alt={item.caption || "Thumbnail"} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border">
            <button
              onClick={() => {
                if (galleryImgUrl) window.open(galleryImgUrl, "_blank");
              }}
              className="w-full flex items-center justify-center gap-2 text-primary text-sm font-medium hover:underline"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              View High-Resolution Photos
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

