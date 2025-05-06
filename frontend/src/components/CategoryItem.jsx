import { Link } from "react-router-dom";

const CategoryItem = ({ category }) => {
	return (
		
			<Link to={"/category" + category.href}>
				<div className='w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden p-4 bg-gray-300 flex items-center justify-center'>
					<img
						src={category.imageUrl}
						alt={category.name}
						className='w-full h-full object-cover rounded-full hover:scale-110 transition-transform duration-300'
						loading='lazy'
					/>
				</div>
				<p className='text-center text-sm md:text-base capitalize'>{category.name}</p>
			</Link>
			
	);
};

export default CategoryItem;
