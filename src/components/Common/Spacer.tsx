import React from 'react';

interface SpacerProps {
  className?: string;
}

const Spacer: React.FC<SpacerProps> = ({ className }) => (
  <div className={className} style={{ flexGrow: 1 }} />
);

export default Spacer;
