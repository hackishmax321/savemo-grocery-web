import React, { useState, useEffect } from 'react';
import GroceryDealCard from '../cards/DealCard';
import promotionService from '../../services/Promotion.service';
import groceryService from '../../services/Item.service';

function DealsContainer({ initialDeals = [], autoLoad = true }) {
  const [deals, setDeals] = useState(initialDeals);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (autoLoad && initialDeals.length === 0) {
      loadActiveDeals();
    }
  }, [autoLoad]);

  const loadActiveDeals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get all active promotions
      const activePromotions = await promotionService.getActivePromotions()
      // console.log(activePromotions)
      
      // Get all active items
      const itemsResult = await groceryService.getAllItems({ isActive: true });
      
      if (!itemsResult.success) {
        throw new Error('Failed to load items');
      }

      // Transform promotions into deals
      const dealsList = [];
      
      for (const promotion of activePromotions) {
        const applicableItems = await getApplicableItemsForPromotion(promotion, itemsResult.items);
        
        // Create a deal for each applicable item
        applicableItems.forEach(item => {
          const discountedPrice = calculateDiscountedPrice(item.price, promotion);
          
          dealsList.push({
            id: `${promotion.docId}_${item.docId}`,
            promotionId: promotion.docId,
            itemId: item.docId,
            
            // Item details
            name: item.name,
            brand: item.brand || 'Generic',
            category: item.category,
            subCategory: item.subCategory,
            image: item.images?.[0] || 'https://via.placeholder.com/300',
            unit: item.unit,
            originalPrice: item.price,
            discountedPrice: discountedPrice,
            discountPercentage: promotion.discountPercentage,
            inStock: item.quantity > 0,
            stockQuantity: item.quantity,
            tags: item.tags || [],
            rating: item.ratings?.average || 0,
            totalRatings: item.ratings?.count || 0,
            
            // Promotion details
            dealType: mapPromotionTypeToDealType(promotion.discountType),
            dealDescription: promotion.description || getDefaultDealDescription(promotion),
            promoCode: promotion.promoCode,
            
            // Time information
            startDate: promotion.startDate,
            endDate: promotion.endDate,
            timeLeft: calculateTimeLeft(promotion.endDate),
            
            // Restrictions
            minimumPurchase: promotion.minimumPurchase,
            maximumDiscount: promotion.maximumDiscount,
            usageLimit: promotion.usageLimit,
            usageCount: promotion.usageCount,
            customerEligibility: promotion.customerEligibility,
            
            // Additional info
            termsAndConditions: promotion.termsAndConditions,
            bannerImage: promotion.bannerImage
          });
        });
      }

      // Sort deals: ending soon first, then by discount percentage
      dealsList.sort((a, b) => {
        // First sort by time left (ending soon)
        if (a.timeLeft && b.timeLeft) {
          const aTime = extractTimeValue(a.timeLeft);
          const bTime = extractTimeValue(b.timeLeft);
          if (aTime !== bTime) return aTime - bTime;
        }
        // Then by discount percentage
        return b.discountPercentage - a.discountPercentage;
      });

      setDeals(dealsList);
    } catch (err) {
      console.error('Error loading active deals:', err);
      setError('Failed to load deals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getApplicableItemsForPromotion = async (promotion, allItems) => {
    const applicableItems = [];

    for (const rule of promotion.applicableItems) {
      if (rule === 'all') {
        return allItems; // Promotion applies to all items
      } else if (rule.type === 'categories') {
        // Add items from selected categories
        const categoryItems = allItems.filter(item => 
          rule.categories.includes(item.category)
        );
        applicableItems.push(...categoryItems);
      } else if (rule.type === 'specific') {
        // Add specific items
        const specificItems = allItems.filter(item => 
          rule.items.includes(item.docId)
        );
        applicableItems.push(...specificItems);
      }
    }

    // Remove duplicates
    return [...new Map(applicableItems.map(item => [item.docId, item])).values()];
  };

  const calculateDiscountedPrice = (originalPrice, promotion) => {
    if (promotion.discountType === 'percentage') {
      const discount = (originalPrice * promotion.discountPercentage) / 100;
      const discountedPrice = originalPrice - discount;
      
      // Apply maximum discount cap if exists
      if (promotion.maximumDiscount && discount > promotion.maximumDiscount) {
        return originalPrice - promotion.maximumDiscount;
      }
      
      return discountedPrice;
    } else if (promotion.discountType === 'fixed') {
      return Math.max(0, originalPrice - promotion.discountValue);
    }
    
    return originalPrice; // For other types like BOGO, handle differently
  };

  const mapPromotionTypeToDealType = (discountType) => {
    const typeMap = {
      'percentage': 'flash-sale',
      'fixed': 'limited-time',
      'buy_x_get_y': 'bogo'
    };
    return typeMap[discountType] || 'special-deal';
  };

  const getDefaultDealDescription = (promotion) => {
    if (promotion.discountType === 'percentage') {
      return `${promotion.discountPercentage}% off on selected items`;
    } else if (promotion.discountType === 'fixed') {
      return `Rs.${promotion.discountValue} off on selected items`;
    } else if (promotion.discountType === 'buy_x_get_y') {
      return 'Buy one get one free';
    }
    return 'Special offer';
  };

  const calculateTimeLeft = (endDate) => {
    if (!endDate) return null;
    
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const extractTimeValue = (timeLeft) => {
    if (!timeLeft) return Infinity;
    if (timeLeft.includes('d')) return parseInt(timeLeft) * 24 * 60;
    if (timeLeft.includes('h')) return parseInt(timeLeft) * 60;
    if (timeLeft.includes('m')) return parseInt(timeLeft);
    return Infinity;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading amazing deals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="text-red-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={loadActiveDeals}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No active deals found</h3>
        <p className="text-gray-500">Check back later for exciting offers!</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 p-4 md:p-6'>
      {deals.map((deal) => (
        <GroceryDealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
}

export default DealsContainer;