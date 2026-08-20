import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  icon: string;
  property?: string;
}

interface VaultDocumentsProps {
  documents: Document[];
}

export function VaultDocuments({ documents }: VaultDocumentsProps) {
  const documentsByType = documents.reduce((acc, doc) => {
    const type = doc.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-foreground font-serif">Document Repository</h2>
          <p className="text-muted-foreground text-sm">All your property documents in one secure place</p>
        </div>
        <Button variant="outline" className="gap-2">
          <span className="material-symbols-outlined text-lg">upload</span>
          Upload Document
        </Button>
      </div>

      {Object.entries(documentsByType).map(([type, docs], groupIndex) => (
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.1 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-foreground">{type}</h3>
            <p className="text-muted-foreground text-sm">{docs.length} documents</p>
          </div>

          <div className="divide-y divide-border">
            {docs.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">{doc.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {doc.property && `${doc.property} • `}{doc.date} • {doc.size}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined">visibility</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined">download</span>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
