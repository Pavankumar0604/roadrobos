import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`bg-card rounded-card shadow-card border border-card ${className}`}>{children}</div>;
};

export default Card;
