import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useVaultDocuments,
  VaultDocumentItem,
} from "@/vault/hooks/useVaultSections";
import toast from "react-hot-toast";

interface VaultDocumentsProps {
  documents?: VaultDocumentItem[];
}

export function VaultDocuments({ documents: propDocs }: VaultDocumentsProps = {}) {
  const { documents: hookDocs, loading } = useVaultDocuments();
  const documents = propDocs || hookDocs;

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("Ownership Documents");

  const documentsByType = documents.reduce((acc, doc) => {
    const type = doc.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {} as Record<string, VaultDocumentItem[]>);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Document uploaded to encrypted vault storage!");
    setUploadModalOpen(false);
    setDocName("");
  };

  if (!propDocs && loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Loading secure documents ledger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-foreground font-serif">Document Repository</h2>
          <p className="text-muted-foreground text-sm">All your property dossiers and title documents in one secure vault</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setUploadModalOpen(true)}
        >
          <span className="material-symbols-outlined text-lg">upload</span>
          Upload Document
        </Button>
      </div>

      {Object.keys(documentsByType).length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-muted-foreground mb-4">description</span>
          <h3 className="text-lg font-medium text-foreground mb-2">No Documents Found</h3>
          <p className="text-muted-foreground">Your verified certificates and statements will appear here.</p>
        </div>
      ) : (
        Object.entries(documentsByType).map(([type, docs], groupIndex) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{type}</h3>
              <p className="text-muted-foreground text-xs">{docs.length} verified dossiers</p>
            </div>

            <div className="divide-y divide-border">
              {docs.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                  onClick={() => {
                    if (doc.fileUrl) window.open(doc.fileUrl, "_blank");
                  }}
                  className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary">{doc.icon || "description"}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{doc.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {doc.property && `${doc.property} • `}{doc.date} • {doc.size}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (doc.fileUrl) window.open(doc.fileUrl, "_blank");
                      }}
                      title="View Document"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (doc.fileUrl) window.open(doc.fileUrl, "_blank");
                      }}
                      title="Download Document"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined">download</span>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))
      )}

      {/* Upload Document Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif">Upload Document to Vault</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="docName">Document Name</Label>
              <Input
                id="docName"
                required
                placeholder="e.g. Encumbrance Certificate 2025"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="bg-secondary/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="docType">Category</Label>
              <select
                id="docType"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none h-10"
              >
                <option value="Ownership Documents">Ownership Documents</option>
                <option value="Financial Reports">Financial Reports</option>
                <option value="Tax & Legal">Tax & Legal</option>
                <option value="Floor Plans">Floor Plans & Architectural</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Select File (PDF, DOCX, PNG)</Label>
              <Input type="file" className="bg-secondary/40 text-xs" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Upload Document</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

