import { CollectionQuery } from '@/models/collection.model';
import AuthContext from '@/shared/auth/context/authContext';
import React, { useContext, useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  return (
    <div className='bg-white px-6  min-h-screen'>
      <h1 className='text-3xl font-bold mb-5'>Welcome Back, {user?.firstName} {user?.lastName}!</h1>
      <h1 className='text-lg text-gray-500'>Dashboard - will be implemented soon - stay tuned!</h1>
    </div>
  );
}
