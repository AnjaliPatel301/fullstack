import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function RatingStars({ rating = 0, size = 'sm', showCount = false, count = 0 }) {
  const sizes = { xs: 'text-xs', sm: 'text-sm', md: 'text-base', lg: 'text-xl' };
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) stars.push(<FaStar key={i} className="text-amber-400" />);
    else if (i === fullStars && hasHalf) stars.push(<FaStarHalfAlt key={i} className="text-amber-400" />);
    else stars.push(<FaRegStar key={i} className="text-gray-300" />);
  }

  return (
    <div className={`flex items-center gap-1 ${sizes[size]}`}>
      {stars}
      {showCount && <span className="text-gray-500 ml-1 text-xs">({count})</span>}
    </div>
  );
}
