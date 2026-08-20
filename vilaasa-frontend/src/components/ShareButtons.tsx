import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/whatsapp.svg",
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "#25D366",
    },
    {
      name: "Facebook",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "#1877F2",
    },
    {
      name: "Instagram",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg",
      url: `https://www.instagram.com/`, // Instagram doesn't support direct sharing via URL
      color: "#E4405F",
    },
    {
      name: "YouTube",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg",
      url: `https://www.youtube.com/`, // YouTube doesn't support direct sharing
      color: "#FF0000",
    },
    {
      name: "Email",
      icon: null,
      url: `mailto:?subject=${encodedTitle}&body=Check%20out%20this%20property%3A%20${encodedUrl}`,
      color: null,
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied!",
      description: "The link has been copied to your clipboard.",
    });
    setIsOpen(false);
  };

  const handleShare = (link: typeof shareLinks[0]) => {
    if (link.name === "Instagram" || link.name === "YouTube") {
      handleCopyLink();
      toast({
        title: "Link Copied",
        description: `${link.name} doesn't support direct sharing. Link copied to clipboard for you to share.`,
      });
    } else {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="material-symbols-outlined text-base">share</span>
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 bg-background border-border" align="end">
        <p className="text-sm font-medium text-foreground mb-3">Share this property</p>
        <div className="flex flex-col gap-2">
          {shareLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleShare(link)}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
            >
              {link.icon ? (
                <div 
                  className="w-5 h-5 flex items-center justify-center"
                  style={{ filter: `drop-shadow(0 0 0 ${link.color})` }}
                >
                  <img 
                    src={link.icon} 
                    alt={link.name}
                    className="w-5 h-5"
                    style={{ filter: 'invert(1)' }}
                  />
                </div>
              ) : (
                <span className="material-symbols-outlined text-lg">mail</span>
              )}
              <span className="text-sm text-foreground">{link.name}</span>
            </button>
          ))}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left mt-1 border-t border-border pt-3"
          >
            <span className="material-symbols-outlined text-lg">link</span>
            <span className="text-sm text-foreground">Copy Link</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
