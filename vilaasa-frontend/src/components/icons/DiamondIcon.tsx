import { cn } from "@/lib/utils";
import vaultIcon from "@/assets/vault-icon.png";

interface DiamondIconProps {
  className?: string;
}

export const DiamondIcon = ({ className }: DiamondIconProps) => (
  <img src={vaultIcon} alt="Vilaasa" className={cn("h-auto w-auto max-h-20", className)} />
);
