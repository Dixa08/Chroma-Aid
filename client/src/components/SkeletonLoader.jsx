const SkeletonLoader = ({ type = 'card' }) => {
  if (type === 'text') {
    return (
      <div className="w-full bg-dark-700 h-6 rounded-md animate-pulse-slow"></div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="glass-panel p-6 rounded-xl animate-pulse-slow flex flex-col gap-3">
        <div className="h-4 bg-dark-700 w-1/3 rounded-md"></div>
        <div className="h-8 bg-dark-700 w-1/2 rounded-md"></div>
      </div>
    );
  }

  // default 'card'
  return (
    <div className="glass-panel p-6 rounded-xl w-full h-48 animate-pulse-slow flex flex-col justify-between">
      <div className="space-y-3 w-full">
        <div className="h-5 bg-dark-700 rounded-md w-3/4"></div>
        <div className="h-4 bg-dark-700 rounded-md w-full"></div>
        <div className="h-4 bg-dark-700 rounded-md w-5/6"></div>
      </div>
      <div className="h-10 bg-dark-700 rounded-lg w-1/3 self-end"></div>
    </div>
  );
};

export default SkeletonLoader;
