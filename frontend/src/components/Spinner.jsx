function Spinner({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div
      className={`animate-spin rounded-full border-4 border-brand-600 border-t-transparent ${sizeMap[size] || sizeMap.md} ${className}`.trim()}
    />
  );
}

export default Spinner;