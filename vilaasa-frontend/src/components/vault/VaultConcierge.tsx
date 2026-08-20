import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ServiceRequest {
  id: string;
  type: string;
  property: string;
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
  description: string;
}

const requestTypes = [
  { id: "resale", label: "Request Resale Valuation", icon: "sell", description: "Get current market valuation for your property" },
  { id: "visit", label: "Request Site Visit Pickup", icon: "directions_car", description: "Arrange transportation to visit your property" },
  { id: "maintenance", label: "Request Maintenance/Repair", icon: "build", description: "Report issues or request repairs" },
  { id: "tax", label: "Request Tax Certificate", icon: "description", description: "Get tax documents for filing returns" },
  { id: "legal", label: "Legal Document Request", icon: "gavel", description: "Request copies of agreements or deeds" },
  { id: "other", label: "Other Request", icon: "help", description: "Any other service you need" },
];

const mockProperties = [
  { id: "1", name: "Colton Beach Resort, Goa" },
  { id: "2", name: "Zen Wellness Spa, Goa" },
  { id: "3", name: "Palm Royale Villa, Dubai" },
];

const mockPreviousRequests: ServiceRequest[] = [
  {
    id: "1",
    type: "tax",
    property: "Colton Beach Resort, Goa",
    status: "completed",
    createdAt: "2024-12-15",
    description: "Tax certificate for FY 2024-25",
  },
  {
    id: "2",
    type: "visit",
    property: "Palm Royale Villa, Dubai",
    status: "in-progress",
    createdAt: "2025-01-03",
    description: "Site visit scheduled for January 15th",
  },
];

export function VaultConcierge() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [description, setDescription] = useState("");

  const handleSubmitRequest = () => {
    if (!selectedType || !selectedProperty) {
      toast.error("Please select a request type and property");
      return;
    }

    toast.success("Request submitted successfully", {
      description: "Our concierge team will contact you within 24 hours.",
    });

    setSelectedType(null);
    setSelectedProperty("");
    setDescription("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-primary/20 text-primary";
      case "in-progress": return "bg-gold/20 text-gold";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light text-foreground font-serif">Concierge Desk</h2>
        <p className="text-muted-foreground text-sm">White-glove service at your fingertips</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* New Request Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Raise a Request</h3>
            <p className="text-muted-foreground text-sm">Select the service you need</p>
          </div>

          <div className="p-6">
            {/* Request Type Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {requestTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    selectedType === type.id
                      ? "border-gold bg-gold/10"
                      : "border-border hover:border-gold/50 hover:bg-muted/50"
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl mb-2 ${
                    selectedType === type.id ? "text-gold" : "text-muted-foreground"
                  }`}>
                    {type.icon}
                  </span>
                  <p className="text-sm font-medium text-foreground">{type.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                </button>
              ))}
            </div>

            {selectedType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                {/* Property Selection */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Select Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProperties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Additional Details (Optional)</label>
                  <Textarea
                    placeholder="Provide any additional information..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Submit Button */}
                <Button onClick={handleSubmitRequest} variant="hero" className="w-full">
                  <span className="material-symbols-outlined mr-2">send</span>
                  Submit Request
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Previous Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Previous Requests</h3>
          </div>

          <div className="divide-y divide-border">
            {mockPreviousRequests.map((request) => {
              const typeInfo = requestTypes.find(t => t.id === request.type);
              return (
                <div key={request.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-muted-foreground">{typeInfo?.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{typeInfo?.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{request.property}</p>
                      <p className="text-xs text-muted-foreground mt-1">{request.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{request.createdAt}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(request.status)}`}>
                          {request.status.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-muted/30 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="material-symbols-outlined text-lg">info</span>
              Average response time: 4 hours
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
