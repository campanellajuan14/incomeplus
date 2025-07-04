
import React from 'react';

interface FilterSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2">
        {icon && <div className="text-gray-800">{icon}</div>}
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

export default FilterSection;
