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
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.data.success && res.data.data) {
        updateQueueItem(item.id, { status: "success", progress: 100 });
        toast.success(`Uploaded ${item.file.name}`);
        setUploadedMedia((prev) => [...prev, res.data.data]);
        if (onMediaUploaded) onMediaUploaded(res.data.data);
        
        // Remove from queue after brief delay
        setTimeout(() => {
          removeQueueItem(item.id);
        }, 1200);
      }
    } catch (err: unknown) {
      const errMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Upload failed";
      updateQueueItem(item.id, { status: "error", error: errMsg, progress: 0 });
      toast.error(`Error uploading ${item.file.name}: ${errMsg}`);
    }
  };

  const uploadAll = async () => {
    const idleItems = queuedFiles.filter(
      (item) => item.status === "idle" || item.status === "error",
    );
    for (const item of idleItems) {
      await uploadItem(item);
    }
  };

  const handleDeleteUploaded = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this media asset?")) return;
    try {
      const res = await api.delete<ApiResponse<{ id: string }>>(
        `/media/${mediaId}`,
      );
      if (res.data.success) {
        toast.success("Media deleted successfully");
        setUploadedMedia((prev) => prev.filter((m) => m.id !== mediaId));
        if (onMediaDeleted) onMediaDeleted(mediaId);
      }
    } catch (err: unknown) {
      const errMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to delete media";
      toast.error(errMsg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag and Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? "border-[#D4AF37] bg-[#D4AF37]/10"
            : "border-[#2a2a2a] bg-[#111111] hover:border-[#D4AF37]/50"
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#1a1a1a] text-[#D4AF37] mb-4">
          <Upload className="h-6 w-6" />
        </div>
        <h4 className="text-base font-semibold text-white">
          Drag & drop luxury media assets here
        </h4>
        <p className="mt-1 text-xs text-[#a0a0a0]">
          Supports high-res JPG, PNG, WebP, MP4 Video, and PDF brochures (up to
          100MB per file)
        </p>

        <label className="mt-4 inline-flex cursor-pointer items-center rounded-lg border border-[#D4AF37] bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-black hover:bg-[#b8952b] transition-all">
          <span>Browse Files</span>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf,video/mp4"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {/* Upload Queue Section */}
      {queuedFiles.length > 0 && (
        <div className="space-y-4 rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold text-white">
              Files to Upload ({queuedFiles.length})
            </h5>
            <button
              onClick={uploadAll}
              className="rounded-lg bg-[#D4AF37] px-4 py-1.5 text-xs font-bold text-black hover:bg-[#b8952b] transition-colors"
            >
              Upload All Files
            </button>
          </div>

          <div className="space-y-3">
            {queuedFiles.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-[#262626] bg-[#1a1a1a] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Preview Thumbnail & Name */}
                <div className="flex items-center space-x-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#333333] bg-[#0f0f0f]">
                    {item.file.type === "application/pdf" ? (
                      <FileText className="h-8 w-8 text-[#D4AF37]" />
                    ) : (
                      <img
                        src={item.previewUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate text-xs font-medium text-white max-w-[200px]">
                      {item.file.name}
                    </p>
                    <p className="text-[11px] text-[#a0a0a0]">
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
                    className="rounded border border-[#333333] bg-[#111111] px-2.5 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="HERO_IMAGE">Hero Image</option>
                    <option value="GALLERY">Gallery Photo</option>
                    <option value="BROCHURE_PDF">Brochure PDF</option>
                    <option value="VIDEO_MP4">Video Walkthrough</option>
                    <option value="TOUR_360">360 Virtual Tour</option>
                    <option value="FLOOR_PLAN">Floor Plan</option>
                  </select>

                  {/* Alt Text */}
                  <input
                    type="text"
                    placeholder="Alt text caption"
                    value={item.altText}
                    onChange={(e) =>
                      updateQueueItem(item.id, { altText: e.target.value })
                    }
                    className="w-36 rounded border border-[#333333] bg-[#111111] px-2.5 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                  />

                  {/* Featured Toggle */}
                  <label className="flex items-center space-x-1.5 text-xs text-[#a0a0a0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isFeatured}
                      onChange={(e) =>
                        updateQueueItem(item.id, {
                          isFeatured: e.target.checked,
                        })
                      }
                      className="rounded border-[#333333] text-[#D4AF37] focus:ring-0"
                    />
                    <span>Featured</span>
                  </label>

                  {/* Action / Status */}
                  <div className="flex items-center space-x-2">
                    {item.status === "uploading" && (
                      <div className="flex items-center space-x-2 text-xs text-[#D4AF37]">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
                        <span>Uploading...</span>
                      </div>
                    )}
                    {item.status === "success" && (
                      <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                    )}
                    {item.status === "error" && (
                      <AlertCircle className="h-5 w-5 text-[#ef4444]" />
                    )}
                    {item.status === "idle" && (
                      <button
                        onClick={() => uploadItem(item)}
                        className="rounded border border-[#D4AF37]/50 bg-[#1f1a0e] px-3 py-1.5 text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
                      >
                        Upload
                      </button>
                    )}
                    <button
                      onClick={() => removeQueueItem(item.id)}
                      className="text-[#a0a0a0] hover:text-[#ef4444] p-1"
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
          <h5 className="text-sm font-semibold text-white">
            Current Media Assets ({uploadedMedia.length})
          </h5>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {uploadedMedia.map((media) => (
              <div
                key={media.id}
                className="group relative overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111111] shadow-lg"
              >
                <div className="aspect-[4/3] w-full bg-[#181818]">
                  {media.mediaType === "BROCHURE_PDF" ? (
                    <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
                      <FileText className="h-8 w-8 text-[#D4AF37]" />
                      <span className="mt-1 line-clamp-1 text-[11px] text-[#a0a0a0]">
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
                  <span className="absolute left-2 top-2 flex items-center space-x-1 rounded bg-[#D4AF37] px-2 py-0.5 text-[10px] font-bold text-black shadow-md">
                    <Star className="h-2.5 w-2.5 fill-black" />
                    <span>Featured</span>
                  </span>
                )}

                <div className="p-2 flex items-center justify-between border-t border-[#222222]">
                  <span className="text-[10px] font-mono uppercase text-[#a0a0a0]">
                    {media.mediaType.replace("_", " ")}
                  </span>
                  {media.id && (
                    <button
                      onClick={() => handleDeleteUploaded(media.id!)}
                      title="Delete asset"
                      className="rounded p-1 text-[#a0a0a0] hover:bg-[#222222] hover:text-[#ef4444] transition-colors"
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
        <div className="flex justify-end pt-4 border-t border-[#2a2a2a]">
          <button
            type="button"
            onClick={onFinish}
            className="rounded-lg bg-[#D4AF37] px-6 py-2.5 text-sm font-bold text-black shadow-lg shadow-[#D4AF37]/20 hover:bg-[#b8952b] transition-all"
          >
            Finish & View Property
          </button>
        </div>
      )}
    </div>
  );
};
