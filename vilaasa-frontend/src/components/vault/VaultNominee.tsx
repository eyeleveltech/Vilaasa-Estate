import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  useVaultNominees,
  NomineeItem,
  LegacyDocumentItem,
} from "@/vault/hooks/useVaultSections";
import toast from "react-hot-toast";

interface VaultNomineeProps {
  nominees?: NomineeItem[];
  legacyDocs?: LegacyDocumentItem[];
}

const relationships = ["Spouse", "Son", "Daughter", "Parent", "Sibling", "Trust / Estate", "Other"];

export function VaultNominee({
  nominees: propNominees,
  legacyDocs: propLegacyDocs,
}: VaultNomineeProps = {}) {
  const {
    nominees: hookNominees,
    legacyDocs: hookLegacyDocs,
    loading,
    submitting,
    addNominee,
    deleteNominee,
    addLegacyDoc,
    deleteLegacyDoc,
  } = useVaultNominees();

  const nominees = propNominees || hookNominees;
  const legacyDocs = propLegacyDocs || hookLegacyDocs;

  const [isAddingNominee, setIsAddingNominee] = useState(false);
  const [newNominee, setNewNominee] = useState({
    name: "",
    relationship: "Spouse",
    email: "",
    phone: "",
    share: 50,
    isPrimary: false,
  });

  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: "",
    type: "Will",
    fileUrl: "https://pdfobject.com/pdf/sample.pdf",
  });

  const handleAddNomineeSubmit = async () => {
    if (!newNominee.name || !newNominee.relationship) {
      toast.error("Please fill in nominee name and relationship");
      return;
    }

    try {
      await addNominee({
        name: newNominee.name,
        relationship: newNominee.relationship,
        email: newNominee.email || undefined,
        phone: newNominee.phone || undefined,
        share: Number(newNominee.share) || 100,
        isPrimary: Boolean(newNominee.isPrimary),
      });
      setIsAddingNominee(false);
      setNewNominee({
        name: "",
        relationship: "Spouse",
        email: "",
        phone: "",
        share: 50,
        isPrimary: false,
      });
    } catch {
      // Error handled in hook
    }
  };

  const handleAddDocSubmit = async () => {
    if (!newDoc.name || !newDoc.type) {
      toast.error("Please fill in document name and category");
      return;
    }

    try {
      await addLegacyDoc({
        name: newDoc.name,
        type: newDoc.type,
        fileUrl: newDoc.fileUrl,
      });
      setIsAddingDoc(false);
      setNewDoc({
        name: "",
        type: "Will",
        fileUrl: "https://pdfobject.com/pdf/sample.pdf",
      });
    } catch {
      // Handled in hook
    }
  };

  if (!propNominees && loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Decrypting Succession & Legacy Ledger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light text-foreground font-serif">Nominee & Legacy</h2>
        <p className="text-muted-foreground text-sm">Protect your wealth for the next generation</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Nominees List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">family_restroom</span>
              <div>
                <h3 className="font-semibold text-foreground">Beneficiaries</h3>
                <p className="text-muted-foreground text-xs">Designated nominees for your assets</p>
              </div>
            </div>
            <Dialog open={isAddingNominee} onOpenChange={setIsAddingNominee}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Add Nominee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Nominee</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name *</label>
                    <Input
                      value={newNominee.name}
                      onChange={(e) => setNewNominee({ ...newNominee, name: e.target.value })}
                      placeholder="Enter full legal name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Relationship *</label>
                    <Select 
                      value={newNominee.relationship} 
                      onValueChange={(v) => setNewNominee({ ...newNominee, relationship: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationships.map((rel) => (
                          <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        type="email"
                        value={newNominee.email}
                        onChange={(e) => setNewNominee({ ...newNominee, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone</label>
                      <Input
                        value={newNominee.phone}
                        onChange={(e) => setNewNominee({ ...newNominee, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Share Percentage</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={newNominee.share}
                      onChange={(e) => setNewNominee({ ...newNominee, share: Number(e.target.value) })}
                      placeholder="25"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={newNominee.isPrimary}
                      onChange={(e) => setNewNominee({ ...newNominee, isPrimary: e.target.checked })}
                      className="rounded border-input text-gold focus:ring-gold"
                    />
                    <label htmlFor="isPrimary" className="text-xs text-muted-foreground cursor-pointer">
                      Designate as Primary Beneficiary
                    </label>
                  </div>
                  <Button
                    onClick={handleAddNomineeSubmit}
                    disabled={submitting}
                    variant="hero"
                    className="w-full mt-2"
                  >
                    {submitting ? "Registering..." : "Add Nominee"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="divide-y divide-border">
            {nominees.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No nominees registered yet. Add beneficiaries above.
              </div>
            ) : (
              nominees.map((nominee, index) => (
                <motion.div
                  key={nominee.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">
                      {nominee.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{nominee.name}</p>
                      {nominee.isPrimary && (
                        <span className="text-xs px-2 py-0.5 bg-gold/20 text-gold rounded-full font-semibold">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{nominee.relationship}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      {nominee.email && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">mail</span>
                          {nominee.email}
                        </span>
                      )}
                      {nominee.phone && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">phone</span>
                          {nominee.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gold font-mono">{nominee.share}%</p>
                      <p className="text-xs text-muted-foreground">Share</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNominee(nominee.id)}
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-opacity p-2"
                      title="Remove Nominee"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="p-4 bg-muted/30 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="material-symbols-outlined text-lg">info</span>
              Total share allocated: {nominees.reduce((sum, n) => sum + (n.share || 0), 0)}%
            </div>
          </div>
        </motion.div>

        {/* Legacy Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">folder_special</span>
                <h3 className="font-semibold text-foreground">Legacy Documents</h3>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {legacyDocs.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No legacy documents uploaded yet.
                </div>
              ) : (
                legacyDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      if (doc.fileUrl) window.open(doc.fileUrl, "_blank");
                    }}
                    className="p-3 rounded-lg bg-muted/30 border border-border flex items-center gap-3 group hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.type} • {doc.uploadedAt}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLegacyDoc(doc.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-opacity p-1 h-8 w-8"
                      title="Delete document"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </Button>
                  </div>
                ))
              )}

              <Dialog open={isAddingDoc} onOpenChange={setIsAddingDoc}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 mt-4">
                    <span className="material-symbols-outlined text-lg">upload</span>
                    Upload Legacy Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="font-serif">Upload Legacy Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Document Title</label>
                      <Input
                        value={newDoc.name}
                        onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                        placeholder="e.g. Registered Living Will (DIFC)"
                        className="bg-secondary/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Document Type</label>
                      <select
                        value={newDoc.type}
                        onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                        className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none h-10"
                      >
                        <option value="Will">Last Will & Testament</option>
                        <option value="Trust">Family Trust Deed</option>
                        <option value="Power of Attorney">Power of Attorney</option>
                        <option value="Healthcare Directive">Healthcare Directive</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Document URL / Sample</label>
                      <Input
                        value={newDoc.fileUrl}
                        onChange={(e) => setNewDoc({ ...newDoc, fileUrl: e.target.value })}
                        placeholder="https://..."
                        className="bg-secondary/40"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setIsAddingDoc(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddDocSubmit} disabled={submitting}>
                        {submitting ? "Storing..." : "Store in Vault"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="p-4 bg-gold/5 border-t border-gold/20 mt-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-gold">shield</span>
              <div>
                <p className="text-sm font-medium text-foreground">End-to-End Encrypted</p>
                <p className="text-xs text-muted-foreground">Your legacy documents are stored with bank-grade AES-256 security</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
