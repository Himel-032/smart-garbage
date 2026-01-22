const Card = ({ title, children }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      {title && (
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">{title}</h2>
      )}
      {children}
    </div>
  );
};

export default Card;
