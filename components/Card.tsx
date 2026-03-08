import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, hover }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-card shadow-card border border-card ${hover ? 'hover:shadow-card-hover transition-shadow' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
