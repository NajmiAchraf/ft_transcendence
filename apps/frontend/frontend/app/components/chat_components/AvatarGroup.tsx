'use client';
import React from 'react';
import Image from "next/image";

const users = [
  {
    id: 1,
    image: '/3ziya.png'
  },
  {
    id: 2,
    image: '/3ziya.png'
  },
  {
    id: 3,
    image: '/3ziya.png'
  },
  {
    id: 4,
    image: '/3ziya.png'
  },
  {
    id: 5,
    image: '/3ziya.png'
  },
  {
    id: 6,
    image: '/3ziya.png'
  },
  {
    id: 7,
    image: '/3ziya.png'
  },
  {
    id: 8,
    image: '/3ziya.png'
  },
  {
    id: 9,
    image: '/3ziya.png'
  },
  {
    id: 10,
    image: '/3ziya.png'
  },
]


function AvatarGroup(){
  const slicedUsers = users.slice(0, 4);
  
  const positionMap = {
    0: 'buttom-0 right-[15px]',
    1: 'bottom-0 right-[20px]',
    2: 'bottom-0 right-[25px]',
    3: 'bottom-0 right-[30px]'

  }

  return (
    <div className="relative h-11 w-11">
      {slicedUsers.map((user, index) => (
        <div 
          key={user.id} 
          className={`
            absolute
            inline-block 
            rounded-full 
            overflow-hidden
            h-[21px]
            w-[21px]
            ${positionMap[index as keyof typeof positionMap]}
          `}>
            <Image
              fill
              src={user?.image || '/images/placeholder.jpg'}
              alt="Avatar"
            />
        </div>
      ))}
    </div>
  );
}

export default AvatarGroup;
