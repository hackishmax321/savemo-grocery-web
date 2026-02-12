import React from 'react';
import MapWrapper from '../components/maps/MapWrapper';

function AboutUsPage() {
  const branches = [
    {
      name: 'Wattala Branch',
      address: '123 Galle Road, Wattala, Sri Lanka',
      hours: '7:00 AM - 10:00 PM',
      phone: '+94 777 258 358',
      image: 'https://lh3.googleusercontent.com/p/AF1QipM3z6v4mD-kd6vG66h457yLy1B_k2OOQ0A5cbL5=s680-w680-h510-rw'
    },
    {
      name: 'Colombo 10 Branch',
      address: '456 Maradana Road, Colombo 10, Sri Lanka',
      hours: '6:00 AM - 11:00 PM',
      phone: '+94 777 258 358',
      image: 'https://lh3.googleusercontent.com/p/AF1QipO_emgbss0VXPTTFvSOWOr-L1vZSel0o2ktrv15=s680-w680-h510-rw'
    },
    {
      name: 'Dehiwala Branch',
      address: '789 Galle Road, Dehiwala, Sri Lanka',
      hours: '7:00 AM - 10:00 PM',
      phone: '+94 777 258 358',
      image: 'https://lh3.googleusercontent.com/p/AF1QipNwkMujXiKxVZ_zTF8MpU_sWYbo9ItV2AKsXF9A=s680-w680-h510-rw'
    },
    {
      name: 'Malabe Branch',
      address: '321 Kandy Road, Malabe, Sri Lanka',
      hours: '8:00 AM - 9:00 PM',
      phone: '+94 777 258 358',
      image: 'https://lh3.googleusercontent.com/p/AF1QipNwkMujXiKxVZ_zTF8MpU_sWYbo9ItV2AKsXF9A=s680-w680-h510-rw'
    }
  ];

  const values = [
    {
      title: 'Our Mission',
      description: 'To provide Sri Lankan families with access to fresh, affordable, and high-quality groceries while supporting local farmers and producers.',
      icon: '🎯'
    },
    {
      title: 'Our Vision',
      description: 'To become the most trusted grocery network in Sri Lanka, known for exceptional quality, customer service, and community support.',
      icon: '🌟'
    },
    {
      title: 'Our Values',
      description: 'Quality first, customer-centric approach, supporting local economy, sustainability, and community development.',
      icon: '❤️'
    }
  ];

  return (
    <div className='min-h-screen px-4 sm:px-8 lg:px-12 py-8 bg-primary text-black mt-16 md:mt-20'>
      {/* Hero Section */}
      <div className='max-w-7xl mx-auto'>
        <h1 className='head-text font-bold text-3xl md:text-4xl lg:text-4xl text-font-secondary mb-6'>
          About SaveMo
        </h1>
        <p className='text-lg md:text-xl text-gray-700 mb-12 max-w-4xl'>
          Sri Lanka's premier grocery network committed to delivering fresh, affordable, 
          and high-quality products to households across the island since 2010.
        </p>

        {/* Our Story Section - Text Left, Image Right */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16'>
          <div>
            <h2 className='text-3xl font-bold text-font-secondary mb-6'>Our Story</h2>
            <div className='space-y-4 text-gray-700'>
              <p>
                Founded in 2010, SaveMo began as a small family-run grocery store in Wattala. 
                Our founder, Mr. Kamal Perera, envisioned creating a grocery network that 
                would make quality products accessible and affordable for all Sri Lankan families.
              </p>
              <p>
                What started as a single store has now grown into a network of four branches 
                across the Western Province, serving thousands of satisfied customers daily.
              </p>
              <p>
                At SaveMo, we believe in the power of community. We source over 70% of our 
                products directly from local farmers and producers, ensuring freshness while 
                supporting the Sri Lankan economy.
              </p>
            </div>
          </div>
          <div className='flex items-center justify-center'>
            <img 
              src='https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop&q=60'
              alt='SaveMo Store Interior'
              className='rounded-2xl shadow-2xl w-full h-[400px] object-cover'
            />
          </div>
        </div>

        {/* Our Values Section - Image Left, Text Right */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16'>
          <div className='lg:order-1 order-2'>
            <h2 className='text-3xl font-bold text-font-secondary mb-6'>Our Commitment</h2>
            <div className='space-y-6'>
              {values.map((value, index) => (
                <div key={index} className='bg-white p-6 rounded-xl shadow-lg'>
                  <div className='flex items-start gap-4'>
                    <span className='text-3xl'>{value.icon}</span>
                    <div>
                      <h3 className='text-xl font-semibold text-font-secondary mb-2'>{value.title}</h3>
                      <p className='text-gray-600'>{value.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className='flex items-center justify-center lg:order-2 order-1'>
            <img 
              src='https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=600&auto=format&fit=crop&q=60'
              alt='Fresh Groceries'
              className='rounded-2xl shadow-2xl w-full h-[500px] object-cover'
            />
          </div>
        </div>

        {/* Our Branches Section */}
        <div className='mb-16'>
          <h2 className='text-3xl font-bold text-font-secondary mb-8 text-left'>Our Branches</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {branches.map((branch, index) => (
              <div 
                key={index} 
                className='bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300'
              >
                <div className='h-48 overflow-hidden'>
                  <img 
                    src={branch.image}
                    alt={branch.name}
                    className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                  />
                </div>
                <div className='p-6'>
                  <h3 className='text-xl font-bold text-font-secondary mb-3'>{branch.name}</h3>
                  <div className='space-y-2 text-gray-600'>
                    <p className='flex items-center gap-2'>
                      <span className='text-font-secondary'>📍</span>
                      {branch.address}
                    </p>
                    <p className='flex items-center gap-2'>
                      <span className='text-font-secondary'>🕒</span>
                      {branch.hours}
                    </p>
                    <p className='flex items-center gap-2'>
                      <span className='text-font-secondary'>📞</span>
                      {branch.phone}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Section - Text Left, Image Right */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16'>
          <div>
            <h2 className='text-3xl font-bold text-font-secondary mb-6'>Community Impact</h2>
            <div className='space-y-4 text-gray-700'>
              <p>
                SaveMo is more than just a grocery store - we're an integral part of the 
                communities we serve. Through our various initiatives, we actively contribute 
                to local development and welfare.
              </p>
              <p>
                Our "Harvest Support Program" directly connects farmers to consumers, 
                eliminating middlemen and ensuring fair prices for both parties. We've 
                supported over 500 local farmers since our inception.
              </p>
              <p>
                We also run monthly community outreach programs, providing essential 
                groceries to underprivileged families and supporting local schools and 
                community centers.
              </p>
            </div>
          </div>
          <div className='flex items-center justify-center'>
            <img 
              src='https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop&q=60'
              alt='Community Engagement'
              className='rounded-2xl shadow-2xl w-full h-[400px] object-cover'
            />
          </div>
        </div>

        {/* Future Plans Section */}
        <div className='w-full rounded-xl overflow-hidden shadow-2xl'>
          {/* <h2 className='text-3xl font-bold mb-6'>Looking Ahead</h2> */}
          <MapWrapper />
        </div>
      </div>
    </div>
  );
}

export default AboutUsPage;