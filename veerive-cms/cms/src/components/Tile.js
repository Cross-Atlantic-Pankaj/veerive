import React from 'react';
import * as LucideIcons from 'lucide-react';

const toPascalCase = (str) => {
    if (!str) return 'HelpCircle'; // Default to a fallback icon if no name is provided
    return str
      .toLowerCase()
      .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^(.)/, (_, c) => c.toUpperCase());
  };

const Tile = ({ bg, icon, color = 'white', size = 32 }) => {
    const pascalCaseIcon = toPascalCase(icon);
    const IconComponent = LucideIcons[pascalCaseIcon] || LucideIcons['HelpCircle'];
    
    return (
        <div style={{ 
            backgroundColor: bg, 
            padding: '1rem', 
            borderRadius: '8px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
        }}>
            <IconComponent color={color} size={size} />
        </div>
    );
};

export default Tile; 