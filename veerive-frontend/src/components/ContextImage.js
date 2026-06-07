import React from 'react';
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

const ContextImage = ({ 
  context, 
  post, 
  theme,
  tileTemplate, 
  className = "w-full h-full", 
  fallbackText = "1000 × 630",
  showFallback = true 
}) => {
  // Determine what type of content we're displaying
  const isContextDisplay = context && !post && !theme;
  const isPostDisplay = post && !context && !theme;
  const isThemeDisplay = theme && !context && !post;
  
  // Get the appropriate image URL based on display type
  let imageUrl = null;
  let altText = 'Image';
  
  if (isContextDisplay) {
    imageUrl = context.imageUrl;
    altText = context.contextTitle || 'Context image';
  } else if (isPostDisplay) {
    imageUrl = post.imageUrl;
    altText = post.postTitle || 'Post image';
  } else if (isThemeDisplay) {
    imageUrl = theme.imageUrl;
    altText = theme.themeTitle || 'Theme image';
  }
  
  // If we have a specific image for the content type, show it
  if (imageUrl) {
    return (
      <div className={`${className} rounded-lg overflow-hidden`}>
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, fall back to tile or placeholder
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback content that shows if image fails to load */}
        <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{ display: 'none' }}>
          {tileTemplate ? (
            <Tile
              bg={tileTemplate.bg}
              icon={tileTemplate.icon}
              color={tileTemplate.color}
              size={tileTemplate.size}
            />
          ) : showFallback ? (
            <div className="text-gray-400 text-xs sm:text-sm">
              {fallbackText}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
  
  // No specific image found, fallback to tile template or placeholder
  if (tileTemplate) {
    return (
      <div className={`${className} rounded-lg overflow-hidden`}>
        <Tile
          bg={tileTemplate.bg}
          icon={tileTemplate.icon}
          color={tileTemplate.color}
          size={tileTemplate.size}
        />
      </div>
    );
  }
  
  // Final fallback
  if (showFallback) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-xs sm:text-sm text-gray-500`}>
        {fallbackText}
      </div>
    );
  }
  
  return null;
};

export default ContextImage;
