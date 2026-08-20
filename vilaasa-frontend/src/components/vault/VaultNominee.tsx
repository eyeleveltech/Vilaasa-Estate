import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Nominee {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  share: number;
  isPrimary: boolean;
}

interface LegacyDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

const mockNominees: Nominee[] = [
  {
    id: "1",
    name: "Priya Kumar",
    relationship: "Spouse",
    email: "priya.kumar@email.com",
    phone: "+91 98765 43210",
    share: 50,
    isPrimary: true,
  },
  {
    id: "2",
    name: "Arjun Kumar",
    relationship: "Son",
    email: "arjun.kumar@email.com",
    phone: "+91 98765 43211",
    share: 25,
    isPrimary: false,
  },
  {
    id: "3",
    name: "Ananya Kumar",
    relationship: "Daughter",
    email: "ananya.kumar@email.com",
    phone: "+91 98765 43212",
    share: 25,
    isPrimary: false,
  },
];

const mockLegacyDocuments: LegacyDocument[] = [
  { id: "1", name: "Last Will & Testament", type: "Will", uploadedAt: "2024-06-15" },
  { id: "2", name: "Family Trust Deed", type: "Trust", uploadedAt: "2024-06-15" },
];

const relationships = ["Spouse", "Son", "Daughter", "Parent", "Sibling", "Other"];

export function VaultNominee() {
  const [isAddingNominee, setIsAddingNominee] = useState(false);
  const [newNominee, setNewNominee] = useState({
    name: "",
    relationship: "",
    email: "",
    phone: "",
    share: 0,
  });

  const handleAddNominee = () => {
    if (!newNominee.name || !newNominee.relationship) {
      toast.error("Please fill in required fields");
      return;
    }

    toast.success("Nominee added successfully", {
      description: "Your beneficiary list has been updated.",
    });

    setIsAddingNominee(false);
    setNewNominee({ name: "", relationship: "", email: "", phone: "", share: 0 });
  };

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
                  <Button onClick={handleAddNominee} variant="hero" className="w-full">
                    Add Nominee
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="divide-y divide-border">
            {mockNominees.map((nominee, index) => (
              <motion.div
                key={nominee.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">
                    {nominee.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{nominee.name}</p>
                    {nominee.isPrimary && (
                      <span className="text-xs px-2 py-0.5 bg-gold/20 text-gold rounded-full">Primary</span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{nominee.relationship}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">mail</span>
                      {nominee.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">phone</span>
                      {nominee.phone}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gold font-mono">{nominee.share}%</p>
                  <p className="text-xs text-muted-foreground">Share</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 bg-muted/30 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="material-symbols-outlined text-lg">info</span>
              Total share allocated: {mockNominees.reduce((sum, n) => sum + n.share, 0)}%
            </div>
          </div>
        </motion.div>

        {/* Legacy Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">folder_special</span>
              <h3 className="font-semibold text-foreground">Legacy Documents</h3>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {mockLegacyDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-lg bg-muted/30 border border-border flex items-center gap-3 group hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">description</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.type} • {doc.uploadedAt}</p>
                </div>
                <span className="material-symbols-outlined text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  download
                </span>
              </div>
            ))}

            <Button variant="outline" className="w-full gap-2 mt-4">
              <span className="material-symbols-outlined text-lg">upload</span>
              Upload Document
            </Button>
          </div>

          <div className="p-4 bg-gold/5 border-t border-gold/20">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-gold">shield</span>
              <div>
                <p className="text-sm font-medium text-foreground">End-to-End Encrypted</p>
                <p className="text-xs text-muted-foreground">Your legacy documents are stored with bank-grade security</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
