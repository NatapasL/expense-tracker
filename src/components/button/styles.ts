import type { ButtonVariant } from "./types";

export const baseStyle = 'inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-discord-bg disabled:opacity-50 disabled:cursor-not-allowed';

export const variantStyle: Record<ButtonVariant, string> = {
  primary: 'bg-[#5865F2] hover:bg-[#4752C4] text-white focus:ring-[#5865F2]',
  secondary: 'bg-discord-sidebar hover:bg-discord-panel text-discord-text-normal focus:ring-gray-500',
  danger: 'bg-discord-red hover:bg-[#c9383b] text-white focus:ring-discord-red',
}