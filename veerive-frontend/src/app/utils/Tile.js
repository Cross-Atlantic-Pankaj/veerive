import * as LucideIcons from 'lucide-react';

const Tile = ({ bg, icon, color, size }) => {
  // Default to 'Image' icon if icon is undefined or invalid
  const iconName = icon && typeof icon === 'string' ? icon : 'Image';
  const IconComponent =
    LucideIcons[iconName.charAt(0).toUpperCase() + iconName.slice(1)] || LucideIcons.Image;

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: bg || '#f8f9fa', color: color || '#000000' }}
    >
      <IconComponent size={size || 32} />
    </div>
  );
};

const parseJsxCode = (jsxCode) => {
  if (!jsxCode || typeof jsxCode !== 'string') {
    console.warn(`Invalid or missing jsxCode: ${jsxCode}`);
    return null;
  }

  const regex = /bg="([^"]+)"\s+icon="([^"]+)"\s+color="([^"]+)"\s+size=\{(\d+)\}/;
  const match = jsxCode.match(regex);
  if (match) {
    return {
      bg: match[1],
      icon: match[2],
      color: match[3],
      size: parseInt(match[4], 10),
    };
  }

  console.warn(`Invalid jsxCode format: ${jsxCode}`);
  return null;
};

export { Tile, parseJsxCode };