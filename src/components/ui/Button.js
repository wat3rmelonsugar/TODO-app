export function Button({ children, variant = "default", className = "", ...props }) {
    const baseStyles = "px-4 py-2 rounded-lg font-medium transition";
    const variants = {
      default: "bg-blue-500 text-white hover:bg-blue-600",
      outline: "border border-gray-300 hover:bg-gray-100",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      icon: "p-2 rounded-full bg-gray-200 hover:bg-gray-300",
    };
  
    return (
      <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  }
  