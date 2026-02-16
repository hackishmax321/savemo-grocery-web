import React, { useState } from 'react'
import { AiOutlineSearch, AiOutlineCaretDown } from 'react-icons/ai';
import {Categories} from '../../constants/Categories';
import { useNavigate } from 'react-router-dom';

function SearchBar() {
    const navigate = useNavigate();
    const [term, setTerm] = useState('');
    const [category, setCategory] = useState('All Categories');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Add "All Categories" option to the beginning of categories
    const allCategories = [
        { id: 0, name: 'All Categories', details: 'Search all grocery items', icon: '🔍' },
        ...Categories
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        const searchParams = new URLSearchParams();
        
        // Add search term if exists
        if (term.trim()) {
            searchParams.append('q', term.trim());
        }
        
        // Add category if not "All Categories"
        if (category !== 'All Categories') {
            searchParams.append('category', category);
        }
        
        // Navigate to products page with search params
        navigate(`/products?${searchParams.toString()}`);
        window.location.reload();
    };

    const handleCategorySelect = (catName) => {
        setCategory(catName);
        setIsCategoryOpen(false);
    };

    const handleInputChange = (e) => {
        setTerm(e.target.value);
        // Optional: Implement live search suggestions
    };

    return (
        <div className='flex-1 mx-6 my-3 max-w-2xl md:max-w-xl'>
            <form onSubmit={handleSearch} className='relative flex'>
                {/* Category Dropdown */}
                <div className='relative'>
                    <button
                        type='button'
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className='h-full px-4 py-2 bg-highlight border border-gray-300 rounded-l-lg hover:bg-gray-200 
                        transition-colors flex items-center justify-between min-w-[140px] text-sm'
                    >
                        <div className='flex items-center gap-2'>
                            <span className='truncate max-w-[80px]'>{category}</span>
                            <AiOutlineCaretDown className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isCategoryOpen && (
                        <>
                            {/* Backdrop */}
                            <div 
                                className='fixed inset-0 z-40'
                                onClick={() => setIsCategoryOpen(false)}
                            />
                            
                            {/* Dropdown Content */}
                            <div className='absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border 
                            border-gray-200 z-50 max-h-96 overflow-y-auto'>
                                {allCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type='button'
                                        onClick={() => handleCategorySelect(cat.name)}
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors 
                                        flex items-center gap-3 ${category === cat.name ? 'bg-blue-50 text-blue-600' : ''}`}
                                    >
                                        <span className='text-lg'>{cat.icon}</span>
                                        <div className='flex-1'>
                                            <div className={`font-medium ${category === cat.name ? 'text-blue-600' : 'text-gray-700'}`}>{cat.name}</div>
                                            <div className='text-xs text-gray-500 truncate'>{cat.details}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Search Input */}
                <div className='relative flex-1'>
                    <input 
                        type='text' 
                        value={term}
                        onChange={handleInputChange}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => {
                            setTimeout(() => setIsSearchFocused(false), 200);
                        }}
                        placeholder='Search Products Here'
                        className='w-full px-4 py-2 pl-10 bg-primary text-font-secondary border-y border-r 
                        border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                        placeholder-gray-400 rounded-r-lg'
                    /> 
                    <AiOutlineSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg' />
                </div>

                {/* Search Button */}
                <button 
                    type='submit'
                    className='absolute right-0 top-1/2 transform -translate-y-1/2 bg-danger text-font-primary 
                    h-full w-14 px-auto rounded-r-lg flex justify-center items-center hover:bg-secondary/90 
                    transition-opacity'
                >
                    <AiOutlineSearch className='text-xl' />
                </button>
            </form>

            {/* Optional: Search Suggestions Dropdown */}
            {isSearchFocused && term && (
                <div className='absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 
                z-50 max-h-96 overflow-y-auto'>
                    <div className='p-4'>
                        <div className='text-sm text-gray-500 mb-2'>Search suggestions for "{term}"</div>
                        {/* You can add actual search suggestions here */}
                        <div className='text-sm text-gray-700'>No suggestions yet. Start typing...</div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchBar