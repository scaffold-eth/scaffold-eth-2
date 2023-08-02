import { AvatarComponent } from "@rainbow-me/rainbowkit";
import Blockies from "react-blockies";

// Custom Avatar for RainbowKit
export const BlockieAvatar: AvatarComponent = ({ address, ensImage, size }) =>
  ensImage ? (
    // Don't want to use nextJS Image here (and adding remote patterns for the URL)
    // eslint-disable-next-line
    <img className="rounded-full" src={ensImage} width={size} height={size} alt={`${address} avatar`} />
  ) : (
    <Blockies className="rounded-full" seed={address?.toLowerCase() as string} scale={size > 30 ? 10 : 3.75} />
  );
