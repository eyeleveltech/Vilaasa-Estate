import React, { useState, useRef } from "react";
import {
  FileText,
  UploadCloud,
  CheckCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  Link as LinkIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

interface BrochureUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export const BrochureUploader: React.FC<BrochureUploaderProps> = ({
  value,
  onChange,
  folder = "vilaasa/brochures",
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [showManualUrl, setShowManualUrl] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate PDF / Document format
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF brochure document");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Brochure file size must be less than 10MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    setIsUploading(true);
    const toastId = toast.loading("Uploading brochure to Cloudinary...");

    try {
      const res = await api.post("/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success && res.data.data?.url) {
        const uploadedUrl = res.data.data.url;
        onChange(uploadedUrl);
        toast.success("Brochure uploaded successfully!", { id: toastId });
      } else {
        toast.error("Failed to retrieve brochure upload URL", { id: toastId });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg =
        error.response?.data?.message || error.message || "Brochure upload failed";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#dcdcdc] flex items-center space-x-1.5">
          <FileText className="h-3.5 w-3.5 text-[#D4AF37]" />
          <span>Official Brochure PDF Document</span>
        </label>
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-[11px] text-[#a0a0a0] hover:text-[#D4AF37] transition-colors flex items-center space-x-1"
        >
          <LinkIcon className="h-3 w-3" />
          <span>{showManualUrl ? "Upload File" : "Paste URL"}</span>
        </button>
      </div>

      {/* Uploaded File Card */}
      {value && !showManualUrl ? (
        <div className="flex items-center justify-between rounded-xl border border-[#D4AF37]/30 bg-[#161616] p-3.5 shadow-lg">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <p className="truncate text-xs font-bold text-white">
                  {value.split("/").pop() || "Official Property Brochure"}
                </p>
                <CheckCircle className="h-3.5 w-3.5 text-[#22c55e] shrink-0" />
              </div>
              <p className="truncate font-mono text-[10px] text-[#a0a0a0]">
                {value}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-2.5 py-1.5 text-xs text-white hover:border-[#D4AF37] transition-colors"
            >
              <ExternalLink className="h-3 w-3 text-[#D4AF37]" />
              <span>Preview</span>
            </a>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Replace PDF"
              className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-1.5 text-[#a0a0a0] hover:text-white hover:border-[#D4AF37] transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              title="Remove brochure"
              className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-1.5 text-[#a0a0a0] hover:text-[#ef4444] transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : showManualUrl ? (
        /* Manual URL Entry Mode */
        <div className="space-y-1">
          <input
            type="url"
            placeholder="https://res.cloudinary.com/vilaasa/sample-brochure.pdf"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#181818] px-3.5 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
          />
          <p className="text-[11px] text-[#777777]">
            Paste external PDF dossier or architectural catalogue URL
          </p>
        </div>
      ) : (
        /* Drag and Drop Zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            isDragOver
              ? "border-[#D4AF37] bg-[#D4AF37]/5"
              : "border-[#2a2a2a] bg-[#141414] hover:border-[#D4AF37]/60 hover:bg-[#181818]"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e1e] text-[#D4AF37] shadow group-hover:scale-105 transition-transform mb-2">
            {isUploading ? (
              <RefreshCw className="h-5 w-5 animate-spin text-[#D4AF37]" />
            ) : (
              <UploadCloud className="h-5 w-5" />
            )}
          </div>
          <p className="text-xs font-semibold text-white">
            {isUploading
              ? "Uploading to Cloudinary..."
              : "Click to upload or drag & drop Brochure PDF"}
          </p>
          <p className="text-[11px] text-[#777777] mt-0.5">
            Supports high-res PDF Dossiers (Up to 10MB)
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};
