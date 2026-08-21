import React, { useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { PropertyMedia, ApiResponse } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
  mediaType: string;
  altText: string;
  orderIndex: number;
  isFeatured: boolean;
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

interface MediaUploaderProps {
  propertyId: string;
  existingMedia?: PropertyMedia[];
  onMediaUploaded?: (newMedia: PropertyMedia) => void;
  onMediaDeleted?: (mediaId: string) => void;
  onFinish?: () => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  propertyId,
  existingMedia = [],
  onMediaUploaded,
  onMediaDeleted,
  onFinish,
}) => {
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [uploadedMedia, setUploadedMedia] =
    useState<PropertyMedia[]>(existingMedia);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newQueue: QueuedFile[] = Array.from(files).map((file, idx) => {
      const isPdf = file.type === "application/pdf";
      const isHero = uploadedMedia.length === 0 && idx === 0;

      return {
        id: `${file.name}-${Date.now()}-${idx}`,
        file,
        previewUrl: isPdf ? "" : URL.createObjectURL(file),
        mediaType: isPdf ? "BROCHURE_PDF" : isHero ? "HERO_IMAGE" : "GALLERY",
        altText: file.name.replace(/\.[^/.]+$/, ""),
        orderIndex: uploadedMedia.length + idx,
        isFeatured: isHero,
        status: "idle",
        progress: 0,
      };
    });

    setQueuedFiles((prev) => [...prev, ...newQueue]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const updateQueueItem = (id: string, updates: Partial<QueuedFile>) => {
    setQueuedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const removeQueueItem = (id: string) => {
    setQueuedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const uploadItem = async (item: QueuedFile) => {
    updateQueueItem(item.id, { status: "uploading", progress: 20 });
    const formData = new FormData();
    formData.append("file", item.file);
    formData.append("mediaType", item.mediaType);
    formData.append("altText", item.altText);
    formData.append("orderIndex", item.orderIndex.toString());
    formData.append("isFeatured", item.isFeatured ? "true" : "false");

    try {
      updateQueueItem(item.id, { progress: 60 });
      const res = await api.post<ApiResponse<PropertyMedia>>(
        `/media/upload/${propertyId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data.success && res.data.data) {
        updateQueueItem(item.id, { status: "success", progress: 100 });
        const newMedia = res.data.data;
        setUploadedMedia((prev) => [...prev, newMedia]);
        if (onMediaUploaded) onMediaUploaded(newMedia);
        toast.success(`Uploaded: ${item.file.name}`);
      } else {
        throw new Error(res.data.message || "Upload failed");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to upload file";
      updateQueueItem(item.id, { status: "error", error: errorMsg });
      toast.error(`Error uploading ${item.file.name}: ${errorMsg}`);
    }
  };

  const uploadAll = async () => {
    const pendingItems = queuedFiles.filter(
      (item) => item.status === "idle" || item.status === "error",
    );
    if (pendingItems.length === 0) return;

    for (const item of pendingItems) {
      await uploadItem(item);
    }
  };

  const handleDeleteUploaded = async (mediaId: string) => {
    try {
      const res = await api.delete(`/media/${mediaId}`);
      if (res.data.success) {
        setUploadedMedia((prev) => prev.filter((m) => m.id !== mediaId));
        if (onMediaDeleted) onMediaDeleted(mediaId);
        toast.success("Media asset removed");
      }
    } catch {
      toast.error("Failed to delete media asset");
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border bg-secondary/20 hover:border-primary/50"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary shadow mb-3">
          <Upload className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">
          Drag and drop ultra-HD media files here
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Supports JPG, PNG, WEBP, MP4, and PDF brochures (Up to 50MB per file)
        </p>

        <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-xs uppercase tracking-[0.1em] font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm">
          Browse Files
          <input
            type="file"
            multiple
            accept="image/*,video/mp4,application/pdf"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      {/* Upload Queue */}
      {queuedFiles.length > 0 && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Upload Queue ({queuedFiles.length} files)
              </h4>
              <p className="text-xs text-muted-foreground">
                Configure asset types and metadata before upload
              </p>
            </div>
            <Button
              size="sm"
              onClick={uploadAll}
              className="text-xs"
            >
              Upload All Files
            </Button>
          </div>

          <div className="space-y-3">
            {queuedFiles.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Preview Thumbnail & Name */}
                <div className="flex items-center space-x-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary">
                    {item.file.type === "application/pdf" ? (
                      <FileText className="h-7 w-7 text-primary" />
                    ) : (
                      <img
                        src={item.previewUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate text-xs font-semibold text-foreground max-w-[200px]">
                      {item.file.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {/* Metadata Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Media Type */}
                  <select
                    value={item.mediaType}
                    onChange={(e) =>
                      updateQueueItem(item.id, { mediaType: e.target.value })
                    }
                    className="rounded-md border border-input bg-secondary/50 px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="HERO_IMAGE">Hero Image</option>
                    <option value="GALLERY">Gallery Photo</option>
                    <option value="BROCHURE_PDF">Brochure PDF</option>
                    <option value="VIDEO_MP4">Video Walkthrough</option>
                    <option value="TOUR_360">360 Virtual Tour</option>
                    <option value="FLOOR_PLAN">Floor Plan</option>
                  </select>

                  {/* Alt Text */}
                  <Input
                    type="text"
                    placeholder="Alt caption"
                    value={item.altText}
                    onChange={(e) =>
                      updateQueueItem(item.id, { altText: e.target.value })
                    }
                    className="w-32 bg-secondary/50 text-xs h-8"
                  />

                  {/* Featured Toggle */}
                  <label className="flex items-center space-x-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isFeatured}
                      onChange={(e) =>
                        updateQueueItem(item.id, {
                          isFeatured: e.target.checked,
                        })
                      }
                      className="rounded border-input text-primary focus:ring-0"
                    />
                    <span>Featured</span>
                  </label>

                  {/* Action / Status */}
                  <div className="flex items-center space-x-2">
                    {item.status === "uploading" && (
                      <div className="flex items-center space-x-2 text-xs text-primary">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span>Uploading...</span>
                      </div>
                    )}
                    {item.status === "success" && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    )}
                    {item.status === "error" && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                    {item.status === "idle" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => uploadItem(item)}
                        className="text-[11px] h-7 px-2.5"
                      >
                        Upload
                      </Button>
                    )}
                    <button
                      onClick={() => removeQueueItem(item.id)}
                      className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Media Grid */}
      {uploadedMedia.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-semibold text-foreground">
            Current Media Assets ({uploadedMedia.length})
          </h5>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {uploadedMedia.map((media) => (
              <div
                key={media.id}
                className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-md hover:border-primary/40 transition-colors"
              >
                <div className="aspect-[4/3] w-full bg-secondary">
                  {media.mediaType === "BROCHURE_PDF" ? (
                    <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
                      <FileText className="h-8 w-8 text-primary" />
                      <span className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                        {media.altText || "PDF Brochure"}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={media.thumbnailUrl || media.url}
                      alt={media.altText || "Property Media"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>

                {media.isFeatured && (
                  <span className="absolute left-2 top-2 flex items-center space-x-1 rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-md">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    <span>Featured</span>
                  </span>
                )}

                <div className="p-2 flex items-center justify-between border-t border-border bg-secondary/30">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">
                    {media.mediaType.replace(/_/g, " ")}
                  </span>
                  {media.id && (
                    <button
                      onClick={() => handleDeleteUploaded(media.id!)}
                      title="Delete asset"
                      className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Finish & View Property Button */}
      {onFinish && (
        <div className="flex justify-end pt-4 border-t border-border">
          <Button
            type="button"
            onClick={onFinish}
            className="uppercase tracking-[0.1em] font-semibold text-xs"
          >
            Finish & View Property
          </Button>
        </div>
      )}
    </div>
  );
};
