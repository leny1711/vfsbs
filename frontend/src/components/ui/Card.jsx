import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  className = '',
  hover = false,
  padding = 'md',
  ...props 
}) => {
  const classes = [
    'card',
    `card-padding-${padding}`,
    hover ? 'card-hover' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
