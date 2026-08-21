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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

    // Validate PDF format
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
        <Label className="text-xs font-semibold flex items-center space-x-1.5">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span>Official Brochure PDF Document</span>
        </Label>
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1 uppercase tracking-wider"
        >
          <LinkIcon className="h-3 w-3" />
          <span>{showManualUrl ? "Upload File" : "Paste URL"}</span>
        </button>
      </div>

      {/* Uploaded File Card */}
      {value && !showManualUrl ? (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-secondary/40 p-3 shadow-sm">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <p className="truncate text-xs font-semibold text-foreground">
                  {value.split("/").pop() || "Official Property Brochure"}
                </p>
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              </div>
              <p className="truncate font-mono text-[10px] text-muted-foreground">
                {value}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground hover:border-primary transition-colors uppercase tracking-wider font-semibold"
            >
              <ExternalLink className="h-3 w-3 text-primary" />
              <span>Preview</span>
            </a>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Replace PDF"
              className="rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              title="Remove brochure"
              className="rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : showManualUrl ? (
        /* Manual URL Entry Mode */
        <div className="space-y-1">
          <Input
            type="url"
            placeholder="https://res.cloudinary.com/vilaasa/sample-brochure.pdf"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-secondary/40 h-10"
          />
          <p className="text-[11px] text-muted-foreground">
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
              ? "border-primary bg-primary/5"
              : "border-border bg-secondary/20 hover:border-primary/60 hover:bg-secondary/40"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary shadow group-hover:scale-105 transition-transform mb-2">
            {isUploading ? (
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <UploadCloud className="h-5 w-5" />
            )}
          </div>
          <p className="text-xs font-semibold text-foreground">
            {isUploading
              ? "Uploading to Cloudinary..."
              : "Click to upload or drag & drop Brochure PDF"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
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
